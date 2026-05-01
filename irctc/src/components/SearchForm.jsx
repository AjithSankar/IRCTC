import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchForm() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    navigate("/trains", {
      state: { from, to, date },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        className="border p-2 rounded"
        placeholder="From"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
      />

      <input
        className="border p-2 rounded"
        placeholder="To"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <input
        type="date"
        className="border p-2 rounded"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button className="bg-orange-500 text-white py-2 rounded">
        SEARCH TRAINS
      </button>
    </form>
  );
}