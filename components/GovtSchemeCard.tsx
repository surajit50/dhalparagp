import Image from "next/image"
import Link from "next/link"


interface GoverGovtSchemeCardProps {
    imageUrl: string,
    imgurlalt: string,
    officiaUrl: string,
    schemenam: string
}
export const GovtSchemeCard = ({ imageUrl, imgurlalt, officiaUrl, schemenam }: GoverGovtSchemeCardProps) => {
    return (
        <div className="w-[200px] h-[60px]  rounded odd:bg-white even:bg-orange-100 ">
            <Link href={officiaUrl} className="flex items-center gap-1 p-2" target="__blank">

                <Image src={imageUrl} width={100} height={100} alt={imgurlalt} className="w-10 h-10 rounded-full" />
                <h2>{schemenam}</h2>
            </Link>
        </div>
    )
}
