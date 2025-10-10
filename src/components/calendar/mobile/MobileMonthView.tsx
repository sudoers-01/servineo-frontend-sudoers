// src/components/calendar/mobile/MobileMonthView.tsx
export default function MobileMonthView() {
  return (
    <div className=" min-h-screen bg-blue-100">
      <div className=" max-w-md mx-auto bg-gray-100 min-h-screen">

        <div className="flex items-center space-x-4 bg-grey-100" >
          <button className="p-2 hover:bg-gray-200 rounded flex items-center text-black ">
             ←
          </button>
        
         <div className="flex-1">
            <h1 className="text-lg font-bold text-left text-black">
              Calendario de (Usuario)
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}