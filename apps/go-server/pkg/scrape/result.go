package scrape

import (
	"errors"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	resultTypes "github.com/kanakkholwal/go-server/types"
	"github.com/kanakkholwal/go-server/utils"

	"context"

	"github.com/PuerkitoBio/goquery"
)

type ResultFetchProcessError int

const (
	_                                              = iota
	RollNumberDoesNotExist ResultFetchProcessError = iota + 1
	InvalidHtml
	UnknownParsingError
)

func (f ResultFetchProcessError) Error() string {
	switch {
	case errors.Is(f, RollNumberDoesNotExist):
		return "Roll number doesn't exist" // corrected grammar
	case errors.Is(f, InvalidHtml):
		return "Html received is invalid"
	default:
		return "Unknown error"
	}
}

var tokenCache sync.Map

type cachedTokens struct {
	CSRFToken string
	VerToken  string
}

// ParseResultHtml depends on the current html structure of official result website
// - table 0 => last update title table
// - table 1 => row 0 => rollNo, name, fathersName
// - tables from 2 to end, not including last one have semester data
// - two table for each semester
// - first table subjects
// - second table summary
// - last table useless
func ParseResultHtml(body io.ReadCloser) (user *resultTypes.StudentHtmlParsed, parseError error) {
	resultDoc, err := goquery.NewDocumentFromReader(body)
	if err != nil {
		return nil, UnknownParsingError
	}
	user = &resultTypes.StudentHtmlParsed{}
	invalidRoll := resultDoc.Find("h2").FilterFunction(func(index int, selection *goquery.Selection) bool {
		strings.EqualFold(selection.Text(), "Kindly Check the Roll Number")
		return true
	}).Length() > 0
	if invalidRoll {
		return nil, RollNumberDoesNotExist
	}

	tableFind := resultDoc.Find("table")
	semesters := (tableFind.Length() - 3) / 2
	if semesters < 0 || semesters >= tableFind.Length() {
		return nil, InvalidHtml
	}
	user.SemesterResults = make([]resultTypes.SemesterResult, semesters)
	tableFind.Each(func(tableIndex int, selection *goquery.Selection) {
		if tableIndex == 0 || tableIndex == tableFind.Length()-1 {
			//useless table
			return
		}
		if tableIndex == 1 {
			//student roll number, name, father's name
			selection.Find("td").Each(func(cellIndex int, selection *goquery.Selection) {
				txt := strings.Replace(selection.Text(), "ROLL NUMBER", "", -1)
				txt = strings.Replace(txt, "STUDENT NAME", "", -1)
				txt = strings.Replace(txt, "FATHER NAME", "", -1)
				txt = strings.TrimSpace(txt)
				switch cellIndex {
				case 0:
					user.RollNumber = txt
				case 1:
					user.Name = txt
				case 2:
					user.FathersName = txt
				}
			})
		} else if tableIndex%2 == 0 {
			//semester result table: subjects data
			rowFind := selection.Find("tr")
			subjectsResult := make([]resultTypes.SubjectResult, rowFind.Length()-2)
			rowFind.Each(func(rowIndex int, selection *goquery.Selection) {
				if rowIndex < 2 {
					return
				}
				//each row is a subject after row index 1
				selection.Find("td").Each(func(cellIndex int, selection *goquery.Selection) {
					text := strings.TrimSpace(selection.Text())
					switch cellIndex {
					case 1:
						subjectsResult[rowIndex-2].SubjectName = text
					case 2:
						subjectsResult[rowIndex-2].SubjectCode = text
					case 3:
						{
							Credit, _ := strconv.Atoi(text)
							subjectsResult[rowIndex-2].Credit = int64(Credit)
						}
					case 4:
						subjectsResult[rowIndex-2].Grade = text
					case 5:
						{
							points, _ := strconv.Atoi(text)

							subjectsResult[rowIndex-2].Points = int64(points)
							subjectsResult[rowIndex-2].CGPI = float64(points) / float64(subjectsResult[rowIndex-2].Credit)
						}
					}
				})
			})
			user.SemesterResults[(tableIndex-2)/2].SubjectResults = subjectsResult
			user.SemesterResults[(tableIndex-2)/2].SemesterNumber = strings.TrimSpace(fmt.Sprintf("%d", (tableIndex-2)/2+1))
		} else {
			//semester result table: semester overall data
			selection.Find("tr td").Each(func(cellIndex int, selection *goquery.Selection) {
				equalCharPosition := strings.Index(selection.Text(), "=")
				text := strings.TrimSpace(selection.Text()[equalCharPosition+1:])
				if cellIndex == 1 {
					user.SemesterResults[(tableIndex-2)/2].SGPI, _ = strconv.ParseFloat(text, 64)
				} else if cellIndex == 2 {
					user.SemesterResults[(tableIndex-2)/2].SGPITotal, _ = strconv.ParseInt(text, 64, 0)
				} else if cellIndex == 3 {
					user.SemesterResults[(tableIndex-2)/2].CGPI, _ = strconv.ParseFloat(text, 64)
				} else if cellIndex == 4 {
					user.SemesterResults[(tableIndex-2)/2].CGPITotal, _ = strconv.ParseInt(text, 64, 0)
				}
			})
		}
	})
	if len(user.SemesterResults) <= 0 {
		return nil, InvalidHtml
	}
	user.CGPI = user.SemesterResults[len(user.SemesterResults)-1].CGPI
	user.Branch = utils.DetermineDepartment(user.RollNumber)
	// change this after 2099 (ehe)
	batchYear, _ := strconv.Atoi("20" + user.RollNumber[0:2])
	user.Batch = batchYear
	user.Programme = utils.DetermineProgramme(user.RollNumber)
	if user.Programme == "Unknown" {
		return nil, fmt.Errorf("unknown programme for roll number %s", user.RollNumber)
	}
	return user, nil
}

func getResultHtml(rollNumber string, path string) (io.ReadCloser, error) {
	cookieJar, err := cookiejar.New(nil)
	if err != nil {
		return nil, err
	}
	httpClient := &http.Client{
		Jar: cookieJar,
	}

	var csrfToken, verToken string
	if val, ok := tokenCache.Load(path); ok {
		tokens := val.(cachedTokens)
		csrfToken = tokens.CSRFToken
		verToken = tokens.VerToken
	} else {
		// fetch tokens if not cached
		formPageResponse, err := httpClient.Get(path)
		if err != nil {
			return nil, err
		}
		defer formPageResponse.Body.Close()

		formPageDoc, err := goquery.NewDocumentFromReader(formPageResponse.Body)
		if err != nil {
			return nil, err
		}

		var ok bool
		csrfToken, ok = formPageDoc.Find("[name=CSRFToken]").Attr("value")
		if !ok {
			return nil, fmt.Errorf("CSRFToken not found")
		}
		verToken, ok = formPageDoc.Find("[name=RequestVerificationToken]").Attr("value")
		if !ok {
			return nil, fmt.Errorf("RequestVerificationToken not found")
		}

		tokenCache.Store(path, cachedTokens{CSRFToken: csrfToken, VerToken: verToken})
	}

	data := url.Values{
		"RollNumber":               {rollNumber},
		"CSRFToken":                {csrfToken},
		"RequestVerificationToken": {verToken},
		"B1":                       {"Submit"},
	}
	postReq, err := http.NewRequest(http.MethodPost, path, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}
	postReq.Header.Set("DNT", "1")
	postReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// this assumes at least one cookie was set during GET
	// if not using the GET, you may have to separately fetch cookies if required
	resp, err := httpClient.Do(postReq)
	if err != nil {
		return nil, err
	}
	return resp.Body, nil
}

func GetResultByRollNumber(rollNumber string) (*resultTypes.StudentHtmlParsed, error) {
	paths := utils.GetUrlForRollNumber(rollNumber, false)
	if len(paths) == 0 {
		return nil, fmt.Errorf("invalid roll number %s | No result path found", rollNumber)
	}
	var student *resultTypes.StudentHtmlParsed

	for idx, path := range paths {
		log.Printf("Fetching result for roll number %s from %s\n", rollNumber, path)
		// fetch the result html
		resultHtml, err := getResultHtml(rollNumber, path)
		if err != nil {
			return nil, fmt.Errorf("error for rollNumber %s: %w in getResultHtml", rollNumber, err)
		}
		if idx == 0 {
			// first path is the one we want
			student, err = ParseResultHtml(resultHtml)
			if err != nil {
				if errors.Is(err, RollNumberDoesNotExist) {
					return nil, fmt.Errorf("error for rollNumber %s: %w", rollNumber, err)
				}
				return nil, fmt.Errorf("error for rollNumber %s: %w", rollNumber, err)
			}
		} else {

			excess_student, err := ParseResultHtml(resultHtml)
			if err == nil && excess_student != nil {
				log.Printf("error for rollNumber %s: %v\n", rollNumber, err)
			}

			for i := range excess_student.SemesterResults {
				excess_student.SemesterResults[i].SemesterNumber = fmt.Sprintf("Masters Sem 0%d", i+1)
			}
			student.SemesterResults = append(student.SemesterResults, excess_student.SemesterResults...)

			if student.CGPI < excess_student.CGPI {
				student.CGPI = excess_student.CGPI
			}
			if err != nil {
				// for other paths, we just log the error
				log.Printf("error for rollNumber %s: %v\n", rollNumber, err)

			}
		}
	}
	return student, nil

}

func GetResultsFromWeb(forOnlyBatch int) []resultTypes.StudentHtmlParsed {
	//build an array of roll numbers
	rollNumbers := utils.GenRollNumbers(forOnlyBatch)
	println("Total roll numbers to process: ", len(rollNumbers))
	var doneRollNumbers int32 = 0
	//build an array of student objects that contain result
	var students []resultTypes.StudentHtmlParsed

	processNext := func(rollNumber string) (*resultTypes.StudentHtmlParsed, error) {
		resultHtml, err := getResultHtml(rollNumber, utils.GetUrlForRollNumber(rollNumber, false)[0])
		if err != nil {
			err = fmt.Errorf("error for rollNumber %s: %w in getResultHtml", rollNumber, err)
			return nil, err
		}
		student, err := ParseResultHtml(resultHtml)
		if err == nil && student != nil {
			return student, nil
		} else {
			err = fmt.Errorf("error for rollNumber %s: %w", rollNumber, err)
			return nil, err
		}
	}
	const maxRetries = 5
	var retryNum = 0
	for _, rollNumber := range rollNumbers {
		retryNum = 0
	retryLoop:
		for retryNum <= maxRetries {
			var sleepDuration = retryNum + 1 + rand.Intn(2)
			log.Printf("Next fetch after %d seconds\n", sleepDuration)
			time.Sleep(time.Second * time.Duration(sleepDuration))
			student, err := processNext(rollNumber)
			if student != nil {
				students = append(students, *student)
				atomic.AddInt32(&doneRollNumbers, 1)
				log.Printf("Success for rollNumber %s; Done: %d/%d", rollNumber, doneRollNumbers, len(rollNumbers))
				break retryLoop
			} else if errors.Is(err, RollNumberDoesNotExist) {
				atomic.AddInt32(&doneRollNumbers, 1)
				log.Printf("Skipping rollNumber %s, invalid roll number; Done: %d/%d", rollNumber, doneRollNumbers, len(rollNumbers))
				break retryLoop
			}
			retryNum += 1
			log.Printf("Unknown error for roll number %s, will retry: %t", rollNumber, retryNum <= maxRetries)
		}

	}
	return students
}

type ScrapeResult struct {
	RollNumber string                         `json:"rollNumber"`
	Data       *resultTypes.StudentHtmlParsed `json:"data,omitempty"`
	Error      string                         `json:"error,omitempty"`
}

func ScrapeInBulk(ctx context.Context, rollNumbers []string, concurrency int, delay time.Duration) []ScrapeResult {
	rolls := make(chan string)
	results := make(chan ScrapeResult)
	collected := make([]ScrapeResult, 0, len(rollNumbers))
	total := len(rollNumbers)
	fmt.Println("Scraping in bulk...", total, "roll numbers")
	ticker := time.NewTicker(delay)
	defer ticker.Stop()

	var mu sync.Mutex
	progress := 0

	// Start workers
	for range concurrency {
		go func() {
			for roll := range rolls {
				select {
				case <-ticker.C:
					data, err := GetResultByRollNumber(roll)
					res := ScrapeResult{RollNumber: roll}
					if err != nil {
						res.Error = err.Error()
					} else {
						res.Data = data
					}
					select {
					case results <- res:
					case <-ctx.Done():
						return
					}
				case <-ctx.Done():
					return
				}
			}
		}()
	}

	// Feed roll numbers
	go func() {
		for _, roll := range rollNumbers {
			select {
			case rolls <- roll:
			case <-ctx.Done():
				return
			}
		}
		close(rolls)
	}()

	// Collect results and update progress
	for range total {
		select {
		case res := <-results:
			mu.Lock()
			progress++
			fmt.Printf("\rProgress: %d/%d (%f) \n", progress, total, float64(progress)/float64(total)*100)
			mu.Unlock()
			collected = append(collected, res)
		case <-ctx.Done():
			return collected
		}
	}

	fmt.Printf("\nScraping completed: %d results collected\n", len(collected))
	return collected
}
