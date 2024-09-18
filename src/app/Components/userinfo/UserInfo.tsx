"use client";
import { iuser } from "@/app/Services/auth/iuser.interface";
import React from "react";
import Button from "@mui/material/Button";

interface UserInfo {
  userInfo: iuser | null;
}

const UserInfo: React.FC<UserInfo> = ({ userInfo }) => {
  let displayString: string = "";
  if (userInfo) {
    displayString = `${userInfo.name} (${userInfo.roles})`;
  }
  return <Button variant="text">{displayString}</Button>;
};

export default UserInfo;
