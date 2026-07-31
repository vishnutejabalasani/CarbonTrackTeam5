import api from "./axios";

export const getFilteredReports = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await api.get("/reports", { params });
  return res.data;
};

export const sendReportApi = async ({ emails, format, message, startDate, endDate }) => {
  const res = await api.post("/reports/send", {
    emails,
    format,
    message,
    startDate,
    endDate,
  });
  return res.data;
};
