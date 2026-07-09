import { apiRequest } from "./client.js";

export const createRoom = (payload) => {
  return apiRequest("/api/rooms", {
    method: "POST",
    body: payload,
  });
};

export const fetchRooms = () => {
  return apiRequest("/api/rooms");
};

export const fetchRoomByCode = (roomCode) => {
  return apiRequest(`/api/rooms/${roomCode}`);
};

export const voteInRoom = (roomCode, optionId) => {
  return apiRequest(`/api/rooms/${roomCode}/vote`, {
    method: "POST",
    body: { optionId },
  });
};

export const toggleRoomStatus = (roomCode) => {
  return apiRequest(`/api/rooms/${roomCode}/toggle`, {
    method: "PATCH",
  });
};

export const deleteRoom = (roomCode) => {
  return apiRequest(`/api/rooms/${roomCode}`, {
    method: "DELETE",
  });
};