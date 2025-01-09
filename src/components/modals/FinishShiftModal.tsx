"use client";

import SignatureCanvas from "react-signature-canvas";
import { createClient } from "@/utils/supabase/client";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  dateTo24HrTime,
  formatDateString,
  formatTimeString,
  getCurrentRoundedHour,
} from "@/utils/helpers/time";

interface FinishShiftModalProps {
  sheetId: string;
  date: string;
  startTime: string;
  endTime?: string | null;
  location: string;
}

const FinishShiftModal = ({
  sheetId,
  date,
  startTime,
  endTime,
  location,
}: FinishShiftModalProps) => {
  const supabase = createClient();
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [currentTime, setCurrentTime] = useState(
    dateTo24HrTime(getCurrentRoundedHour())
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const openModal = () => {
    setCurrentTime(dateTo24HrTime(new Date()));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFinish = () => {
    if (!sigCanvas.current) return;

    setIsLoading(true);
    const signatureDataUrl = sigCanvas.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    supabase
      .from("sheets")
      .update({ finished: true, signature: signatureDataUrl })
      .eq("id", sheetId)
      .then(({ error }) => {
        setIsLoading(false);
        if (error) {
          setError(error.message);
          return;
        }
        router.push("/sheets");
      });
  };

  return (
    <>
      <button
        onClick={openModal}
        className="bg-pink-500 text-white px-4 py-2 rounded-md"
      >
        Finish shift
      </button>

      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div className="bg-white dark:bg-gray-800 p-6 border rounded-lg w-full md:w-auto md:min-w-[500px]">
            <h2 className="text-center text-lg font-bold mb-4">Finish shift</h2>

            <div className="flex flex-col space-y-4">
              <p className="text-center">
                {location} · {formatDateString(date)} ·{" "}
                {formatTimeString(startTime)} -{" "}
                {endTime
                  ? formatTimeString(endTime)
                  : formatTimeString(currentTime)}
              </p>

              <div>
                <label
                  htmlFor="tutor-signature"
                  className="block text-sm font-medium mb-2 dark:text-white"
                >
                  Tutor&apos;s signature
                </label>
                <div id="tutor-signature" className="border rounded-lg">
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{ width: 500, height: 200 }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row justify-end mt-4">
              <button onClick={closeModal} className="px-4 py-2">
                Cancel
              </button>
              <button
                onClick={handleFinish}
                className="px-4 py-2 bg-primary-600 text-white rounded"
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Finish"
                )}
              </button>
            </div>
            {error && <p className="mt-2 text-center text-error">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default FinishShiftModal;