import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Heading,
  Tailwind,
  Link,
} from "@react-email/components";
import { gpaddress, gpnameinshort } from "@/constants/gpinfor";

interface StartWorkNoticeEmailProps {
  agencyName: string;
  workOrderNumber: string;
  workDescription: string;
  startDate: string;
  completionDate: string;
}

const StartWorkNoticeEmail = ({
  agencyName,
  workOrderNumber,
  workDescription,
  startDate,
  completionDate,
}: StartWorkNoticeEmailProps) => (
  <Html>
    <Head />
    <Tailwind>
      <Body className="bg-slate-50 font-sans py-10">
        <Container className="mx-auto max-w-[600px] bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          {/* Header */}
          <Section className="bg-indigo-700 px-8 py-10 text-center">
            <Heading className="text-white text-2xl font-bold m-0 mb-2">
              Start Work Notice
            </Heading>
            <Text className="text-indigo-100 m-0">
              {gpnameinshort} Gram Panchayat
            </Text>
          </Section>

          {/* Main Content */}
          <Section className="px-8 py-10">
            <Text className="text-lg text-slate-800 mb-4">
              Dear <span className="font-semibold">{agencyName}</span>,
            </Text>
            <Text className="text-slate-600 leading-relaxed mb-6">
              This is to officially notify you to commence the work as per the
              awarded work order. Please ensure all necessary preparations are
              in place to start the project on the scheduled date.
            </Text>

            {/* Project Details */}
            <Section className="bg-slate-50 p-6 rounded-lg border border-slate-100 mb-8">
              <Heading className="text-base font-semibold text-slate-800 mb-4 uppercase tracking-wider">
                Project Commencement Details
              </Heading>

              <div className="space-y-4">
                <Row>
                  <Column className="text-slate-500 w-1/3 text-sm">
                    Work Order No:
                  </Column>
                  <Column className="font-medium text-slate-800">
                    {workOrderNumber}
                  </Column>
                </Row>
                <Hr className="border-slate-200 my-3" />
                <Row>
                  <Column className="text-slate-500 w-1/3 text-sm">
                    Work Description:
                  </Column>
                  <Column className="text-slate-800">{workDescription}</Column>
                </Row>
                <Hr className="border-slate-200 my-3" />
                <Row>
                  <Column className="text-slate-500 w-1/3 text-sm">
                    Start Date:
                  </Column>
                  <Column className="font-semibold text-indigo-600">
                    {startDate}
                  </Column>
                </Row>
                <Row>
                  <Column className="text-slate-500 w-1/3 text-sm">
                    Target Completion:
                  </Column>
                  <Column className="font-semibold text-rose-600">
                    {completionDate}
                  </Column>
                </Row>
              </div>
            </Section>

            {/* Next Steps */}
            <Section className="mb-8">
              <Heading className="text-base font-semibold text-slate-800 mb-4">
                Pre-commencement Requirements
              </Heading>
              <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm">
                <li>Mobilize labor and materials to the site</li>
                <li>Ensure all safety protocols are established</li>
                <li>Install project information boards at the site</li>
                <li>Coordinate with the Junior Engineer for site marking</li>
              </ul>
            </Section>

            <Text className="text-slate-600 text-sm italic">
              Failure to commence work within the stipulated time may lead to
              cancellation of the work order as per the terms and conditions.
            </Text>
          </Section>

          {/* Footer */}
          <Section className="bg-slate-50 px-8 py-6 border-t border-slate-200 text-center">
            <Text className="text-sm font-semibold text-slate-800 mb-1">
              {gpnameinshort} Gram Panchayat Office
            </Text>
            <Text className="text-xs text-slate-500 mb-4">{gpaddress}</Text>
            <div className="flex justify-center gap-4">
              <Link
                href="mailto:dhalparagp@rediffmail.com"
                className="text-indigo-600 text-xs font-medium hover:underline"
              >
                dhalparagp@rediffmail.com
              </Link>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 text-xs">03522-252037</span>
            </div>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default StartWorkNoticeEmail;
