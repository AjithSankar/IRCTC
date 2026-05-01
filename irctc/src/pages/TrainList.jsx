import { useLocation } from "react-router-dom";

export default function TrainList() {
  const location = useLocation();
  const searchData = location.state;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Train Results</h1>

      <div className="bg-white shadow p-4 rounded">
        <p><strong>From:</strong> {searchData?.from}</p>
        <p><strong>To:</strong> {searchData?.to}</p>
        <p><strong>Date:</strong> {searchData?.date}</p>
      </div>
    </div>
  );
}