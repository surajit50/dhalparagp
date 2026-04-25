# Meeting Management System

A comprehensive meeting management system for Gram Panchayat administration, built with Next.js, TypeScript, and Prisma.

## Features

### 🗓️ Meeting Types

- **Upasamity** - Committee meetings
- **General** - General administrative meetings
- **Artho** - Financial meetings
- **Special Gram Sabha** - Special community meetings
- **Regular Gram Sabha** - Monthly community meetings

### 📊 Core Functionality

#### 1. Meeting Creation & Management

- **Add New Meetings**: Comprehensive form with all required fields
- **Meeting Details**: Title, type, date, time, venue, agenda
- **Financial Year Tracking**: Organize meetings by financial year and month
- **Status Management**: Scheduled, In Progress, Completed, Cancelled, Postponed

#### 2. Attendee Management

- **Attendee Registration**: Name, designation, village, contact details
- **Attendance Tracking**: Present/absent status, arrival/departure times
- **Quorum Management**: Track quorum achievement for meetings

#### 3. Resolution Management

- **Resolution Creation**: Number, subject, description, decision
- **Budget Tracking**: Budget amounts and implementation timelines
- **Responsibility Assignment**: Assign responsible persons for implementation
- **Voting Results**: Track voting outcomes for each resolution

#### 4. Document Management

- **Document Upload**: Support for PDF, DOC, DOCX, JPG, JPEG, PNG
- **Document Types**: Agenda, Minutes, Resolution, Attendance, Other
- **File Management**: Secure storage with cloudinary integration

#### 5. Meeting Minutes

- **Key Discussions**: Record main discussion points
- **Decisions Made**: Document all decisions taken
- **Action Items**: Track follow-up actions and responsibilities
- **Next Meeting Planning**: Schedule and agenda for next meeting

### 📈 Analytics & Reporting

#### Dashboard Statistics

- Total meetings count
- Completion rates
- Average attendance
- Resolution counts
- Document uploads

#### Meeting Reports

- **Monthly Trends**: Meeting frequency and attendance patterns
- **Type Distribution**: Breakdown by meeting type
- **Performance Metrics**: Quorum achievement rates
- **Status Analytics**: Meeting completion vs cancellation rates

#### Financial Year Analysis

- Year-wise meeting organization
- Monthly breakdowns
- Attendance trends
- Resolution tracking

## Database Schema

### Core Models

#### Meeting

```typescript
{
  id: string
  title: string
  meetingType: MeetingType
  meetingDate: DateTime
  startTime: string
  endTime: string
  venue: string
  agenda: string
  description?: string
  status: MeetingStatus
  financialYear: string
  month: string
  attendance?: number
  quorumAchieved: boolean
  isPublished: boolean
  createdBy: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### MeetingAttendee

```typescript
{
  id: string
  meetingId: string
  name: string
  designation?: string
  village?: string
  phone?: string
  email?: string
  isPresent: boolean
  arrivalTime?: DateTime
  departureTime?: DateTime
  remarks?: string
}
```

#### Resolution

```typescript
{
  id: string
  meetingId: string
  resolutionNumber: string
  subject: string
  description: string
  decision: string
  budgetAmount?: number
  implementationTimeline?: string
  responsiblePerson?: string
  status: string
  votingResults?: Json
  remarks?: string
}
```

#### MeetingMinutes

```typescript
{
  id: string
  meetingId: string
  keyDiscussions: string
  decisions: string
  actionItems: string
  nextMeetingDate?: DateTime
  nextMeetingAgenda?: string
  attendanceSummary?: string
  specialObservations?: string
}
```

#### MeetingDocument

```typescript
{
  id: string
  meetingId: string
  documentType: string
  title: string
  fileName: string
  fileUrl: string
  fileKey: string
  fileSize?: number
  uploadedBy: string
}
```

## API Endpoints

### Meetings

- `GET /api/meetings` - Get all meetings with filters
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/[id]` - Get specific meeting
- `PUT /api/meetings/[id]` - Update meeting
- `DELETE /api/meetings/[id]` - Delete meeting

### Meeting Minutes

- `GET /api/meetings/[id]/minutes` - Get meeting minutes
- `POST /api/meetings/[id]/minutes` - Create meeting minutes
- `PUT /api/meetings/[id]/minutes` - Update meeting minutes

### Meeting Documents

- `GET /api/meetings/[id]/documents` - Get meeting documents
- `POST /api/meetings/[id]/documents` - Upload meeting document

## File Structure

```
app/(protected)/admindashboard/meeting-manage/
├── page.tsx                    # Main meetings list page
├── add-meeting/
│   └── page.tsx               # Add new meeting form
├── [id]/
│   └── page.tsx               # Meeting details page
└── reports/
    └── page.tsx               # Analytics and reports

app/api/meetings/
├── route.ts                   # Main meetings API
├── [id]/
│   ├── route.ts              # Individual meeting API
│   ├── minutes/
│   │   └── route.ts          # Meeting minutes API
│   └── documents/
│       └── route.ts          # Meeting documents API
```

## Usage

### For Administrators

1. **Access Meeting Management**

   - Navigate to Admin Dashboard
   - Click on "Meeting Management" in the sidebar

2. **Create New Meeting**

   - Click "Add New Meeting"
   - Fill in all required fields
   - Add attendees and resolutions
   - Upload relevant documents
   - Save the meeting

3. **Manage Existing Meetings**

   - View all meetings in the main list
   - Filter by type, status, year, or month
   - Click on any meeting to view details
   - Edit meeting information as needed

4. **Generate Reports**
   - Access the Reports page
   - View analytics and statistics
   - Export reports as needed

### Meeting Workflow

1. **Planning Phase**

   - Create meeting with agenda
   - Set date, time, and venue
   - Add expected attendees

2. **Execution Phase**

   - Mark meeting as "In Progress"
   - Record attendance
   - Document discussions and decisions

3. **Post-Meeting Phase**
   - Create meeting minutes
   - Record resolutions
   - Upload meeting documents
   - Mark meeting as "Completed"

## Security Features

- **Authentication Required**: All routes require valid user session
- **Role-Based Access**: Only admin users can access meeting management
- **Data Validation**: Comprehensive input validation on all forms
- **File Upload Security**: Secure file handling with size and type restrictions

## Future Enhancements

1. **Notification System**

   - Email notifications for meeting schedules
   - SMS reminders for attendees
   - Push notifications for mobile app

2. **Advanced Analytics**

   - Attendance trend analysis
   - Resolution implementation tracking
   - Performance benchmarking

3. **Integration Features**

   - Calendar integration
   - Video conferencing links
   - Digital signature support

4. **Mobile App**
   - Native mobile application
   - Offline capability
   - QR code attendance

## Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary
- **UI Components**: Shadcn/ui
- **State Management**: React hooks
- **Form Handling**: React Hook Form
- **Validation**: Zod schemas

## Installation & Setup

1. **Database Migration**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Environment Variables**

   ```env
   DATABASE_URL="your-mongodb-connection-string"
   CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
   CLOUDINARY_API_KEY="your-cloudinary-api-key"
   CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
   ```

3. **Dependencies**
   ```bash
   npm install @prisma/client cloudinary
   ```

## Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Write comprehensive tests
5. Update documentation

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
