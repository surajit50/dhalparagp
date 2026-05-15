interface adminhomelayoutprops {
  children: React.ReactNode;
  tenderstatus: React.ReactNode;
  visitor: React.ReactNode;
  techev: React.ReactNode;
  nitCount: React.ReactNode;
  aocwork: React.ReactNode;
  cancelwork: React.ReactNode;
  publishwork: React.ReactNode;
  retender: React.ReactNode;
  warishapp: React.ReactNode;
  worksummery: React.ReactNode;
  livedashboard: React.ReactNode;
  holidaycalendar: React.ReactNode;
  noticepopup: React.ReactNode;
  livecharts: React.ReactNode;
}

export default function Adminhomelayoutprops({
 
  children,
  
  livedashboard,
  holidaycalendar,
  noticepopup,
  livecharts,
}: adminhomelayoutprops) {
  return (
    <div className="flex flex-col p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 bg-gradient-to-br from-gray-50 to-orange-50 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Notice Popup Slot */}
      {noticepopup}

      {/* Main Content - Statistics Overview */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-4 md:p-5 lg:p-7 hover:shadow-2xl transition-shadow duration-300 w-full overflow-hidden">
        {children}
      </div>

      

      {/* Live Dashboard Content */}
      <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-1 border border-slate-100 shadow-sm">
        {livedashboard}
      </div>

      {/* Charts Section */}
      <div className="w-full">
        {livecharts}
      </div>

      {/* Holiday Calendar Slot */}
      {holidaycalendar}
    </div>
  );
}
