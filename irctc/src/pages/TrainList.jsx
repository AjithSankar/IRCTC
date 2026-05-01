import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { mockTrains } from "../data/mockTrains";

export default function TrainList() {
  const location = useLocation();
  const searchData = location.state;

  const [trains, setTrains] = useState([]);

  useEffect(() => {
    // simulate API call
    setTimeout(() => {
      setTrains(mockTrains);
    }, 500);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      
      {/* Header */}
      <div className="bg-white p-4 shadow rounded mb-4">
        <h2 className="text-lg font-semibold">
          {searchData?.from} → {searchData?.to}
        </h2>
        <p className="text-sm text-gray-500">
          Date: {searchData?.date}
        </p>
      </div>

      {/* Train List */}
      <div className="flex flex-col gap-4">
        {trains.map((train) => (
          <div
            key={train.id}
            className="bg-white shadow rounded p-4"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">
                  {train.name} ({train.number})
                </h3>
                <p className="text-sm text-gray-500">
                  {train.from} → {train.to}
                </p>
              </div>

              <div className="text-right">
                <p>{train.departure} → {train.arrival}</p>
                <p className="text-sm text-gray-500">
                  {train.duration}
                </p>
              </div>
            </div>

            {/* Classes */}
            <div className="mt-4 flex gap-3">
              {train.classes.map((cls, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded text-sm ${
                    cls.available
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {cls.type} {cls.available ? "Available" : "WL"}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}