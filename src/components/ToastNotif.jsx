import { X } from "lucide-react";

export default function ToastNotif({ data, onClose }) {

  return (
    <div className="bg-white shadow-xl border rounded-xl p-4 w-80 animate-slideIn flex justify-between gap-3">

      <div>
        <p className="font-semibold text-gray-800">
          {data.judul}
        </p>
        <p className="text-sm text-gray-600">
          {data.pesan}
        </p>
      </div>

      <button
        onClick={onClose}
        className="text-gray-400 hover:text-red-500"
      >
        <X size={16}/>
      </button>

    </div>
  );
}