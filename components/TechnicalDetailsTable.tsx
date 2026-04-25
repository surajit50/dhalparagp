import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TechnicalDetailsTableProps {
  technicalDetails: any; // Replace 'any' with the actual type of technicalDetails
}

export function TechnicalDetailsTable({
  technicalDetails,
}: TechnicalDetailsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(technicalDetails.credencial).map(([key, value]) => (
          <TableRow key={`credential-${key}`}>
            <TableCell>Credential</TableCell>
            <TableCell>{key}</TableCell>
            <TableCell>{value ? "Yes" : "No"}</TableCell>
          </TableRow>
        ))}
        {Object.entries(technicalDetails.validityofdocument).map(
          ([key, value]) => (
            <TableRow key={`validity-${key}`}>
              <TableCell>Validity of Document</TableCell>
              <TableCell>{key}</TableCell>
              <TableCell>{value ? "Yes" : "No"}</TableCell>
            </TableRow>
          )
        )}
        <TableRow>
          <TableCell>Other Details</TableCell>
          <TableCell>Bye Law</TableCell>
          <TableCell>{technicalDetails.byelow ? "Yes" : "No"}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Other Details</TableCell>
          <TableCell>PF Registration</TableCell>
          <TableCell>
            {technicalDetails.pfregistrationupdatechalan ? "Yes" : "No"}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Other Details</TableCell>
          <TableCell>Declaration</TableCell>
          <TableCell>{technicalDetails.declaration ? "Yes" : "No"}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Other Details</TableCell>
          <TableCell>Machinery</TableCell>
          <TableCell>{technicalDetails.machinary ? "Yes" : "No"}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Other Details</TableCell>
          <TableCell>Qualify</TableCell>
          <TableCell>{technicalDetails.qualify ? "Yes" : "No"}</TableCell>
        </TableRow>
        {technicalDetails.remarks && (
          <TableRow>
            <TableCell>Other Details</TableCell>
            <TableCell>Remarks</TableCell>
            <TableCell>{technicalDetails.remarks}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
