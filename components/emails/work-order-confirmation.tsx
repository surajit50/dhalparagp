import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Section,
  Column,
  Row,
  Img,
  Link,
  Hr,
  Heading,
  Tailwind,
} from "@react-email/components";

interface WorkOrderConfirmationProps {
  agencyName: string;
  workOrderNumber: string;
  workOrderDate: string;
  nitNumber: string;
  workDescription: string;
  estimatedAmount: string;
  completionPeriod: string;
}

const WorkOrderConfirmation = ({
  agencyName,
  workOrderNumber,
  workOrderDate,
  nitNumber,
  workDescription,
  estimatedAmount,
  completionPeriod,
}: WorkOrderConfirmationProps) => (
  <Html>
    <Head />
    <Tailwind>
      <Body className="bg-gray-100 font-sans">
        <Container className="mx-auto max-w-[600px] p-5">
          {/* Header */}
          <Section className="bg-white px-6 py-8 text-center rounded-t-lg shadow-sm">
            <Heading className="text-2xl font-bold text-gray-900 mb-2">
              Dhalpara Gram Panchayat
            </Heading>
            <Text className="text-gray-600">Work Order Confirmation</Text>
          </Section>

          {/* Main Content */}
          <Section className="bg-white px-6 py-8 shadow-sm mt-4 rounded-lg">
            <Text className="text-lg text-gray-800 mb-4">
              Dear {agencyName},
            </Text>
            <Text className="text-base text-gray-600 leading-relaxed mb-6">
              Your work order has been successfully generated. The details of
              the work order are as follows:
            </Text>

            {/* Work Order Details */}
            <Section className="bg-gray-50 p-6 rounded-lg mb-8">
              <Heading className="text-lg font-semibold text-gray-800 mb-4">
                Work Order Details
              </Heading>

              <div className="space-y-3">
                <Row>
                  <Column className="text-gray-600 w-1/3">
                    Work Order No:
                  </Column>
                  <Column className="font-semibold text-gray-800">
                    {workOrderNumber}
                  </Column>
                </Row>
                <Row>
                  <Column className="text-gray-600 w-1/3">Date:</Column>
                  <Column className="text-gray-800">{workOrderDate}</Column>
                </Row>
                <Row>
                  <Column className="text-gray-600 w-1/3">
                    NIT Reference:
                  </Column>
                  <Column className="text-gray-800">{nitNumber}</Column>
                </Row>
                <Hr className="my-3" />
                <Row>
                  <Column className="text-gray-600 w-1/3">
                    Work Description:
                  </Column>
                  <Column className="text-gray-800">{workDescription}</Column>
                </Row>
                <Row>
                  <Column className="text-gray-600 w-1/3">
                    Estimated Amount:
                  </Column>
                  <Column className="font-semibold text-gray-800">
                    ₹{estimatedAmount}
                  </Column>
                </Row>
                <Row>
                  <Column className="text-gray-600 w-1/3">
                    Completion Period:
                  </Column>
                  <Column className="font-semibold text-blue-600">
                    {completionPeriod}
                  </Column>
                </Row>
              </div>
            </Section>

            {/* Important Instructions */}
            <Section className="mb-8">
              <Heading className="text-lg font-semibold text-gray-800 mb-4">
                Important Instructions
              </Heading>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>
                  Work must commence within 7 days from the date of this work
                  order
                </li>
                <li>Submit weekly progress reports to the concerned officer</li>
                <li>Maintain quality standards as per the specifications</li>
                <li>Follow all safety guidelines during execution</li>
                <li>Complete the work within the stipulated time period</li>
              </ul>
            </Section>

            <Text className="text-gray-600 mb-6">
              Please acknowledge receipt of this work order and confirm your
              acceptance of the terms and conditions.
            </Text>
          </Section>

          {/* Footer */}
          <Hr className="border-gray-200 my-6" />
          <Section className="text-center px-6 py-4 bg-white rounded-b-lg shadow-sm">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Dhalpara Gram Panchayat
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              Contact us:
              <Link
                href={`mailto:dhalparagp@rediffmail.com`}
                className="text-blue-600 ml-1 hover:underline"
              >
                dhalparagp@rediffmail.com
              </Link>
              <span className="mx-2">|</span>
              <span>{8942805098}</span>
            </Text>
            <Text className="text-xs text-gray-400 mt-4">
              This is an official work order from Dhalpara Gram Panchayat.
              Please retain for your records.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default WorkOrderConfirmation;
