import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Member } from '@prisma/client'

interface ViewMemberProps {
    member: Member
}

const ViewMember: React.FC<ViewMemberProps> = ({ member }) => {
    return (
        <div className="container mx-auto py-10">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Member Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="col-span-1">
                            <Avatar className="h-48 w-48">
                                <AvatarImage src={member.photo || undefined} alt={`Photo of ${member.firstName} ${member.lastName || ''}`} />
                                <AvatarFallback className="text-4xl">
                                    {member.firstName}{member.lastName || ''}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="col-span-2">
                            <h2 className="text-2xl font-bold mb-2">
                                {member.salutation} {member.firstName} {member.middleName || ''} {member.lastName || ''}
                            </h2>
                            <p className="text-muted-foreground mb-2">Father/Guardian: {member.fatherGuardianName || 'N/A'}</p>
                            <p className="text-muted-foreground mb-2">Date of Birth: {member.dob.toLocaleDateString()}</p>
                            <p className="text-muted-foreground mb-2">Profession: {member.profession || 'N/A'}</p>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/3">Field</TableHead>
                                <TableHead>Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Gender</TableCell>
                                <TableCell>{member.gender}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Marital Status</TableCell>
                                <TableCell>{member.maritalStatus}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Religion</TableCell>
                                <TableCell>{member.religion}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Caste</TableCell>
                                <TableCell>{member.caste}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Education Qualification</TableCell>
                                <TableCell>{member.eduQualification}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Computer Literate</TableCell>
                                <TableCell>{member.computerLiterate}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Mother Tongue</TableCell>
                                <TableCell>{member.motherTongue}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Blood Group</TableCell>
                                <TableCell>{member.bloodGroup}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Contact No</TableCell>
                                <TableCell>{member.contactNo}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">WhatsApp No</TableCell>
                                <TableCell>{member.whatsappNo}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Email</TableCell>
                                <TableCell>{member.email}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Address</TableCell>
                                <TableCell>{member.address}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">PIN</TableCell>
                                <TableCell>{member.pin}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Post Office</TableCell>
                                <TableCell>{member.postOffice}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">District</TableCell>
                                <TableCell>{member.district}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Police Station</TableCell>
                                <TableCell>{member.policeStation}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Aadhar</TableCell>
                                <TableCell>{member.aadhar}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">PAN</TableCell>
                                <TableCell>{member.pan}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">EPIC</TableCell>
                                <TableCell>{member.epic || 'N/A'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Annual Family Income</TableCell>
                                <TableCell>₹{member.annualFamilyIncome}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Created At</TableCell>
                                <TableCell>{member.createdAt.toLocaleString()}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Updated At</TableCell>
                                <TableCell>{member.updatedAt.toLocaleString()}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Village Data ID</TableCell>
                                <TableCell>{member.villageDataId || 'N/A'}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default ViewMember