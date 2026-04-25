import { formatDate } from "@/utils/utils";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { gpaddress, gpcode, gpnameinshort } from "@/constants/gpinfor";
interface AwardNotificationEmailProps {
  nitNumber: number;
  nitDate: Date;
  biddername: string;
  workslno: number;
}

const AwardNotificationEmail = ({
  nitNumber,
  nitDate,
  workslno,
  biddername,
}: AwardNotificationEmailProps) => {
  const nitdetails = `${nitNumber}/${gpcode}/${nitDate.getFullYear()} Date:${formatDate(
    nitDate,
  )} Work Sl no :${workslno}`;

  return (
    <Html>
      <Head />
      <Body className="bg-[#f8fafc] py-10 font-sans">
        <Container className="bg-white shadow-lg rounded-xl max-w-[680px] mx-auto p-8">
          <Section className="border-b border-[#e2e8f0] pb-8 mb-8 text-center">
            <Heading className="text-[#1e293b] text-3xl mt-4 mb-4 font-bold">
              🏆 Work Order Awarded Notification
            </Heading>
          </Section>

          <Section className="mb-8">
            <Text className="text-lg text-[#334155] mb-6 leading-relaxed">
              Dear{" "}
              <span className="font-semibold text-[#2563eb]">{biddername}</span>
              ,
            </Text>

            <Text className="text-[#475569] text-base mb-6 leading-relaxed">
              We are pleased to inform you that your bid for
            </Text>

            <div className="bg-[#f1f5f9] px-4 py-3 rounded-lg mb-8 border-l-4 border-[#2563eb]">
              <Text className="text-[#1e293b] font-medium text-center">
                NIT No. {nitdetails}
              </Text>
            </div>

            <Text className="text-[#475569] text-base mb-8 leading-relaxed">
              has been accepted as the{" "}
              <span className="font-semibold">lowest responsive bid</span> by
              {gpnameinshort} Gram Panchayat. Your work order has been
              successfully generated and is ready for collection.
            </Text>

            <div className="bg-[#fff7ed] rounded-xl p-6 mb-8 border border-[#fed7aa]">
              <Heading
                as="h2"
                className="text-[#ea580c] text-xl font-semibold mb-4"
              >
                📋 Collection Instructions
              </Heading>
              <ul className="list-disc pl-6 space-y-3">
                <li className="text-[#475569]">
                  Visit {gpnameinshort} Panchayat Office between{" "}
                  <span className="font-medium">
                    10:30 AM - 4:30 PM (Weekdays)
                  </span>
                </li>
                <li className="text-[#475569]">
                  Carry original bid documents and valid ID proof
                </li>
                <li className="text-[#475569]">
                  Submit acknowledgement receipt
                </li>
              </ul>
            </div>

            <div className="bg-[#f0fdfa] rounded-xl p-6 mb-8 border border-[#5eead4]">
              <Heading
                as="h2"
                className="text-[#0d9488] text-xl font-semibold mb-4"
              >
                📍 Office Details
              </Heading>
              <address className="not-italic">
                <Text className="text-[#475569] mb-2">
                  {gpnameinshort} Gram Panchayat Office
                  <br />
                  {gpaddress}
                </Text>
                <Text className="mb-2">
                  📞 <Text>03522-252037</Text>
                </Text>
                <Text>
                  📧{" "}
                  <Link
                    href="mailto:dhalparagp@rediffmail.com"
                    className="text-[#2563eb] hover:underline"
                  >
                    dhalparagp@rediffmail.com
                  </Link>
                </Text>
              </address>
            </div>

            <Section className="mt-10">
              <Text className="text-[#475569] text-base mb-2">
                Yours faithfully,
              </Text>
              <Text className="text-[#1e293b] text-lg font-semibold mb-1">
                {gpnameinshort} Gram Panchayat
              </Text>
              <Text className="text-[#64748b] text-sm">
                Dakshin Dinajpur District
                <br />
                Government of West Bengal
              </Text>
            </Section>
          </Section>

          <Section className="border-t border-[#e2e8f0] pt-6 text-center">
            <Text className="text-xs text-[#64748b]">
              © {new Date().getFullYear()} {gpnameinshort} Gram Panchayat. All
              rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AwardNotificationEmail;
