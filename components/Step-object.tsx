
export type StepObjectType = {
    id: Number,
    title: string,

    fields: string[]
}

interface props {
    step: Number,
    data: StepObjectType[]
}

export default function StepLabels({ step, data }: props) {

    return (

        <section className="grid grid-cols-3">

            {
                data.map((item, i) => (
                    <article key={i}>{item.title}</article>
                ))
            }


        </section>
    )
}