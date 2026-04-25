// app/certificate/page.jsx
import React from 'react';

const FamilyLinkageCertificate = () => {
  // Demo data with nested family structure
  const familyData = {
    certificateNumber: 'বিটি-২০২৩-বিডি-০০৮৫৬',
    issueDate: '১৫ আগস্ট, ২০২৩',
    applicant: {
      name: 'রমেশ শর্মা',
      nameEn: 'Ramesh Sharma',
      dob: '১৫ জানুয়ারি, ১৯৮৫',
      dobEn: 'January 15, 1985',
      citizenshipNo: '১২৩-৪৫৬-৭৮৯'
    },
    familyTree: {
      grandparents: [
        { 
          name: 'গোপাল প্রসাদ শর্মা', 
          nameEn: 'Gopal Prasad Sharma',
          relation: 'পিতামহ',
          relationEn: 'Grandfather',
          dob: '১২ জুলাই, ১৯৪০',
          dobEn: 'July 12, 1940',
          alive: true
        },
        { 
          name: 'লক্ষ্মী দেবী শর্মা', 
          nameEn: 'Laxmi Devi Sharma',
          relation: 'মাতামহী',
          relationEn: 'Grandmother',
          dob: '২৫ মার্চ, ১৯৪৫',
          dobEn: 'March 25, 1945',
          alive: true
        }
      ],
      parents: [
        {
          name: 'হরি প্রসাদ শর্মা',
          nameEn: 'Hari Prasad Sharma',
          relation: 'পিতা',
          relationEn: 'Father',
          dob: '১০ ফেব্রুয়ারি, ১৯৬৫',
          dobEn: 'February 10, 1965',
          spouse: 'সীতা শর্মা',
          spouseEn: 'Sita Sharma',
          children: [
            {
              name: 'রমেশ শর্মা',
              nameEn: 'Ramesh Sharma',
              relation: 'পুত্র',
              relationEn: 'Son',
              dob: '১৫ জানুয়ারি, ১৯৮৫',
              dobEn: 'January 15, 1985',
              spouse: 'অঞ্জলি শর্মা',
              spouseEn: 'Anjali Sharma',
              children: [
                { 
                  name: 'রাজ শর্মা', 
                  nameEn: 'Raj Sharma',
                  relation: 'পৌত্র', 
                  relationEn: 'Grandson', 
                  dob: '২০ মে, ২০১০',
                  dobEn: 'May 20, 2010' 
                },
                { 
                  name: 'প্রিয়া শর্মা', 
                  nameEn: 'Priya Sharma',
                  relation: 'পৌত্রী', 
                  relationEn: 'Granddaughter', 
                  dob: '৮ নভেম্বর, ২০১৩',
                  dobEn: 'November 8, 2013' 
                }
              ]
            },
            {
              name: 'সুরেশ শর্মা',
              nameEn: 'Suresh Sharma',
              relation: 'পুত্র',
              relationEn: 'Son',
              dob: '৩০ জুলাই, ১৯৮৮',
              dobEn: 'July 30, 1988',
              spouse: 'সুনিতা শর্মা',
              spouseEn: 'Sunita Sharma',
              children: [
                { 
                  name: 'অর্জুন শর্মা', 
                  nameEn: 'Arjun Sharma',
                  relation: 'পৌত্র', 
                  relationEn: 'Grandson', 
                  dob: '১৭ সেপ্টেম্বর, ২০১৫',
                  dobEn: 'September 17, 2015' 
                },
                { 
                  name: 'নেহা শর্মা', 
                  nameEn: 'Neha Sharma',
                  relation: 'পৌত্রী', 
                  relationEn: 'Granddaughter', 
                  dob: '২৩ ডিসেম্বর, ২০১৭',
                  dobEn: 'December 23, 2017' 
                }
              ]
            },
            {
              name: 'অমিত শর্মা',
              nameEn: 'Amit Sharma',
              relation: 'পুত্র',
              relationEn: 'Son',
              dob: '১২ মার্চ, ১৯৯২',
              dobEn: 'March 12, 1992',
              spouse: 'পূজা শর্মা',
              spouseEn: 'Pooja Sharma',
              children: [
                { 
                  name: 'বিভান শর্মা', 
                  nameEn: 'Vivaan Sharma',
                  relation: 'পৌত্র', 
                  relationEn: 'Grandson', 
                  dob: '৩ জুন, ২০১৯',
                  dobEn: 'June 3, 2019' 
                },
                { 
                  name: 'দিয়া শর্মা', 
                  nameEn: 'Diya Sharma',
                  relation: 'পৌত্রী', 
                  relationEn: 'Granddaughter', 
                  dob: '১৮ অক্টোবর, ২০২১',
                  dobEn: 'October 18, 2021' 
                }
              ]
            }
          ]
        },
        {
          name: 'সীতা শর্মা',
          nameEn: 'Sita Sharma',
          relation: 'মাতা',
          relationEn: 'Mother',
          dob: '২৩ নভেম্বর, ১৯৭০',
          dobEn: 'November 23, 1970'
        }
      ]
    },
    address: 'ওয়ার্ড নং ৫, কাঠমান্ডু মহানগর, নেপাল',
    addressEn: 'Ward No. 5, Kathmandu Metropolitan City, Nepal',
    issuingAuthority: 'কাঠমান্ডু মহানগর কার্যালয়',
    issuingAuthorityEn: 'Kathmandu Metropolitan City Office',
    issuingDate: '১৫ আগস্ট, ২০২৩',
    issuingDateEn: 'August 15, 2023',
    expiryDate: '১৪ আগস্ট, ২০২৮',
    expiryDateEn: 'August 14, 2028'
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border-4 border-blue-900 relative">
        {/* Certificate Header */}
        <div className="bg-blue-900 text-white py-6 text-center relative">
          <div className="absolute top-2 left-4">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
          </div>
          <div className="absolute top-2 right-4">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold mt-4">নেপাল সরকার</h1>
          <h2 className="text-2xl mt-1">Government of Nepal</h2>
          <h3 className="text-xl mt-4 font-semibold tracking-wider">
            পারিবারিক সংযোগ সার্টিফিকেট (বংশ তালিকা)
          </h3>
          <h3 className="text-xl mt-1 font-semibold tracking-wider">
            Family Linkage Certificate (Bansha Talika)
          </h3>
          <div className="w-48 h-1 bg-yellow-400 mx-auto mt-3"></div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 md:p-10 bg-gradient-to-b from-blue-50 to-white">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-sm">
              সার্টিফিকেট নং: {familyData.certificateNumber} | 
              Certificate No: BT-2023-BD-00856
            </p>
            <p className="text-gray-600 text-sm">
              ইস্যুর তারিখ: {familyData.issueDate} | 
              Issue Date: {familyData.issuingDateEn}
            </p>
          </div>

          {/* Applicant Information */}
          <div className="mb-10">
            <h3 className="text-xl font-bold mb-4 text-blue-900 border-b pb-2">
              আবেদনকারীর তথ্য | Applicant Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600">নাম | Name</p>
                <p className="font-bold">{familyData.applicant.name} / {familyData.applicant.nameEn}</p>
              </div>
              <div>
                <p className="text-gray-600">জন্ম তারিখ | Date of Birth</p>
                <p className="font-bold">{familyData.applicant.dob} / {familyData.applicant.dobEn}</p>
              </div>
              <div>
                <p className="text-gray-600">নাগরিকত্ব নং | Citizenship No</p>
                <p className="font-bold">{familyData.applicant.citizenshipNo}</p>
              </div>
            </div>
          </div>

          {/* Family Tree Visualization */}
          <div className="mb-10">
            <h3 className="text-xl font-bold mb-4 text-blue-900 border-b pb-2">
              পরিবার গাছ | Family Tree
            </h3>
            
            <div className="space-y-8">
              {/* Grandparents */}
              <div className="text-center">
                <p className="font-semibold text-gray-700 mb-2">
                  পিতামহ/মাতামহ | Grandparents
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {(familyData?.familyTree?.grandparents || []).map((gp, idx) => (
                    <div key={idx} className="bg-blue-100 p-4 rounded-lg border border-blue-300 w-64">
                      <p className="font-bold">{gp?.name} / {gp?.nameEn}</p>
                      <p className="text-sm text-gray-600">{gp?.relation} | {gp?.relationEn}</p>
                      <p className="text-sm">{gp?.dob} / {gp?.dobEn}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Parents */}
              <div className="text-center">
                <p className="font-semibold text-gray-700 mb-2">
                  পিতা/মাতা | Parents
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {(familyData?.familyTree?.parents || []).map((parent, idx) => (
                    <div key={idx} className="bg-green-100 p-4 rounded-lg border border-green-300 w-64">
                      <p className="font-bold">{parent?.name} / {parent?.nameEn}</p>
                      <p className="text-sm text-gray-600">{parent?.relation} | {parent?.relationEn}</p>
                      <p className="text-sm">{parent?.dob} / {parent?.dobEn}</p>
                      {parent?.spouse && (
                        <p className="text-sm mt-1">
                          স্ত্রী/স্বামী: {parent?.spouse} / {parent?.spouseEn}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Children Section with Safe Access */}
              <div className="text-center">
                <p className="font-semibold text-gray-700 mb-2">
                  সন্তান ও তাদের পরিবার | Children & Their Families
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Safe access to children array */}
                  {(familyData?.familyTree?.parents?.[0]?.children || []).map((child, idx) => (
                    <div key={idx} className="mb-6">
                      <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300 mb-2">
                        <p className="font-bold">{child?.name} / {child?.nameEn}</p>
                        <p className="text-sm text-gray-600">{child?.relation} | {child?.relationEn}</p>
                        <p className="text-sm">
                          স্ত্রী/স্বামী: {child?.spouse} / {child?.spouseEn}
                        </p>
                        <p className="text-sm">{child?.dob} / {child?.dobEn}</p>
                      </div>
                      
                      {/* Grandchildren */}
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">
                          সন্তান | Children
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {(child?.children || []).map((grandchild, gIdx) => (
                            <div key={gIdx} className="bg-purple-100 p-3 rounded-lg border border-purple-300">
                              <p className="font-bold text-sm">{grandchild?.name} / {grandchild?.nameEn}</p>
                              <p className="text-xs text-gray-600">
                                {grandchild?.relation} | {grandchild?.relationEn}
                              </p>
                              <p className="text-xs">{grandchild?.dob} / {grandchild?.dobEn}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Family Details */}
          <div className="mb-10">
            <h3 className="text-xl font-bold mb-4 text-blue-900 border-b pb-2">
              পরিবারের বিবরণ | Family Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600">স্থায়ী ঠিকানা | Permanent Address</p>
                <p className="font-bold">{familyData.address} / {familyData.addressEn}</p>
              </div>
              <div>
                <p className="text-gray-600">সার্টিফিকেট মেয়াদ | Certificate Valid Until</p>
                <p className="font-bold">{familyData.expiryDate} / {familyData.expiryDateEn}</p>
              </div>
              <div>
                <p className="text-gray-600">ইস্যুকারী কর্তৃপক্ষ | Issuing Authority</p>
                <p className="font-bold">{familyData.issuingAuthority} / {familyData.issuingAuthorityEn}</p>
              </div>
              <div>
                <p className="text-gray-600">ইস্যুর তারিখ | Issuing Date</p>
                <p className="font-bold">{familyData.issuingDate} / {familyData.issuingDateEn}</p>
              </div>
            </div>
          </div>

          {/* Verification Section */}
          <div className="border-t-2 border-blue-200 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-600 mb-2">আবেদনকারীর স্বাক্ষর | Applicants Signature</p>
                <div className="h-16 w-48 border-b border-black"></div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-6">
                  <p className="text-gray-600 mb-2">ইস্যুকারী কর্মকর্তা | Issuing Officer</p>
                  <div className="h-0.5 w-48 bg-black mb-1"></div>
                  <p className="text-sm">(অনুমোদিত স্বাক্ষর | Authorized Signature)</p>
                </div>
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 flex items-center justify-center">
                  সীলমোহর | Stamp
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <div className="text-[120px] font-bold text-blue-400">দাপ্তরিক | OFFICIAL</div>
        </div>

        {/* Footer */}
        <div className="bg-blue-900 text-white text-center py-3 text-sm">
          এই নথিটি ডিজিটালভাবে যাচাই করা হয়েছে | This document is digitally verified
        </div>
      </div>

    </div>
  );
};

export default FamilyLinkageCertificate;
