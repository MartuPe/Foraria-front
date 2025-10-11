import { useState } from "react";
import axios from "axios";

function usePutData<T>(url: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const putData = async (body?: any) => {
    setLoading(true);
    try {
      const res = await axios.put<T>(url, body);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { putData, loading, error };
}

export default usePutData;