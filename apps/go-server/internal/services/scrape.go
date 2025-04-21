package main

import (
	"bytes"
	"errors"
	"fmt"
	"log"
	"net/http"
	urlpkg "net/url" // 👈 use alias to avoid shadowing
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

type Semester struct {
	Semester  string
	SGPI      float64
	SGPITotal float64
	CGPI      float64
	CGPITotal float64
	Courses   []Course
}

type Course struct {
	Name string
	Code string
	CGPI float64
}

type RawResult struct {
	Name      string
	RollNo    string
	Branch    string
	Batch     string
	Programme string
	Semesters []Semester
	Gender    string
}

type HeaderInfo struct {
	URL                      string
	Referer                  string
	CSRFToken                string
	RequestVerificationToken string
}

var headerMap = map[interface{}]HeaderInfo{ // Changed int | string to interface{}
	"20": {
		URL:                      "http://results.nith.ac.in/scheme20/studentresult/result.asp",
		Referer:                  "http://results.nith.ac.in/scheme20/studentresult/index.asp",
		CSRFToken:                "{782F96DF-5115-4492-8CB2-06104ECFF0CA}",
		RequestVerificationToken: "094D0BF7-EE18-E102-8CBF-23C329B32E1C",
	},
	"21": {
		URL:                      "http://results.nith.ac.in/scheme2021/studentresult/result.asp",
		Referer:                  "http://results.nith.ac.in/scheme2021/studentresult/index.asp",
		CSRFToken:                "{4CFC8412-697D-4F3E-9A36-74947F9E04BB}",
		RequestVerificationToken: "AA2E4F5C-48DC-49D6-A9CE-9DDE703F6AD4",
	},
	"22": {
		URL:                      "http://results.nith.ac.in/scheme2022/studentresult/result.asp",
		Referer:                  "http://results.nith.ac.in/scheme2022/studentresult/index.asp",
		CSRFToken:                "{D9C7E347-A5E4-4E52-96FB-7DBB2492D3D5}",
		RequestVerificationToken: "E3449E57-AB26-4125-BD1E-1D94F2A5A4D8",
	},
}

func fetchData(url, rollNo string, headers HeaderInfo) (string, error) {
	form := urlpkg.Values{}
	form.Add("RollNumber", rollNo)
	form.Add("CSRFToken", headers.CSRFToken)
	form.Add("RequestVerificationToken", headers.RequestVerificationToken)
	form.Add("B1", "Submit")

	req, err := http.NewRequest("POST", url, strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Referer", headers.Referer)

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil || res.StatusCode != 200 {
		return "", errors.New("invalid roll number or request error")
	}
	defer res.Body.Close()

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(res.Body)
	if err != nil {
		return "", err
	}

	return buf.String(), nil
}

func parseResult(htmlContent, rollNo, branch, programme string, batch string) (*RawResult, error) {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(htmlContent))
	if err != nil {
		return nil, err
	}

	if doc.Find("#page-wrap").Length() == 0 {
		return nil, errors.New("invalid roll number or missing content")
	}

	student := &RawResult{
		RollNo:    rollNo,
		Branch:    branch,
		Batch:     batch,
		Programme: programme,
		Gender:    "not_specified",
	}

	name := doc.Find("table").Eq(1).Find("td:nth-child(2) > p:nth-child(2)").Text()
	student.Name = strings.TrimSpace(name)

	doc.Find(".pagebreak").Remove()

	doc.Find("table:nth-child(odd)").Each(func(i int, table *goquery.Selection) {
		if i < 2 {
			return
		}
		semester := Semester{Semester: fmt.Sprintf("%02d", i-1)}
		table.Find("tr").Each(func(j int, tr *goquery.Selection) {
			if tr.AttrOr("class", "") != "" {
				return
			}
			tds := tr.Find("td")
			if tds.Length() >= 6 {
				code := strings.TrimSpace(tds.Eq(2).Text())
				name := strings.TrimSpace(tds.Eq(1).Text())
				numerator, _ := strconv.ParseFloat(strings.TrimSpace(tds.Eq(5).Text()), 64)
				denominator, _ := strconv.ParseFloat(strings.TrimSpace(tds.Eq(3).Text()), 64)
				course := Course{
					Name: name,
					Code: code,
					CGPI: numerator / denominator,
				}
				semester.Courses = append(semester.Courses, course)
			}
		})
		student.Semesters = append(student.Semesters, semester)
	})

	doc.Find("table:nth-child(even)").Each(func(i int, table *goquery.Selection) {
		if i < 2 {
			return
		}
		table.Find("td").Each(func(j int, td *goquery.Selection) {
			text := strings.TrimSpace(td.Text())
			switch j {
			case 1:
				val := strings.Split(text, "=")
				student.Semesters[i-2].SGPI, _ = strconv.ParseFloat(strings.TrimSpace(val[len(val)-1]), 64)
			case 2:
				val := strings.Fields(text)
				student.Semesters[i-2].SGPITotal, _ = strconv.ParseFloat(val[len(val)-1], 64)
			case 3:
				val := strings.Split(text, "=")
				student.Semesters[i-2].CGPI, _ = strconv.ParseFloat(strings.TrimSpace(val[len(val)-1]), 64)
			case 4:
				val := strings.Fields(text)
				student.Semesters[i-2].CGPITotal, _ = strconv.ParseFloat(val[len(val)-1], 64)
			}
		})
	})

	return student, nil
}

func scrapeResult(rollNo string, branch string, programme string, batch string) (*RawResult, error) {
	headers, ok := headerMap[batch]
	if !ok {
		return nil, errors.New("batch not supported")
	}

	htmlData, err := fetchData(headers.URL, rollNo, headers)
	if err != nil {
		return nil, err
	}

	student, err := parseResult(htmlData, rollNo, branch, programme, batch)
	if err != nil {
		return nil, err
	}

	return student, nil
}

func main() {
	result, err := scrapeResult("21dec026", "CSE", "B.Tech", "21")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Parsed Result:\n%+v\n", result)
}
