import Image from "next/image";
import { GetFileByPath } from "src/lib/storage";
import { FileWithID } from "src/models/file";


const defaultValue = { year: new Date().getFullYear(), sem: new Date().getMonth() < 6 ? "even": "odd" };

async function getCalender(
    { year, sem }: { year?: number, sem: string } = defaultValue
) : Promise<FileWithID> {
    
    const calender = await GetFileByPath(`calender/${year}/${sem}.png`);
    
    if(!calender){
        const defaultCalender = await GetFileByPath(`calender/${defaultValue.year}/${defaultValue.sem}.png`);
        return Promise.resolve(JSON.parse(JSON.stringify(defaultCalender)));
    }

    return Promise.resolve(JSON.parse(JSON.stringify(calender)));
}



export default async function StoragePage({ searchParams }: { searchParams: { year?: number, sem?:  "even" | "odd" }}) {

    const year = searchParams?.year || new Date().getFullYear();
    const sem = searchParams?.sem || new Date().getMonth() < 6 ? "even": "odd";

    const calender = await getCalender({ year, sem });

    return (
        <div className="mx-auto space-y-5 text-center">
            <h1 className="text-3xl font-bold">Calender</h1>

            <picture className="mx-auto">
                <Image src={calender.publicUrl} alt="Calender" width={1720} height={2400}  className="mx-auto w-full h-auto object-cover" />
                <figcaption className="text-sm text-gray-500 mt-2">Calender for the year {year} {sem} semester</figcaption>
            </picture>


        </div>
    )
}