import request from "./request";

export const reservationApi = async () => await request.get("/api/home/reservation")
