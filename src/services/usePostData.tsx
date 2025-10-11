import { useState } from "react";
import axios from "axios";

function usePostData<T>(url: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postData = async (body?: any) => {
    setLoading(true);
    try {
      const res = await axios.post<T>(url, body);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { postData, loading, error };
}

export default usePostData;