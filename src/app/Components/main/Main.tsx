"use client";
import React, { useState, useEffect } from "react";
import { Box, Stack, Grid, Typography } from "@mui/material";
import {
  RacwaResponsiveHeader,
  DataDrivenRacwaFooter,
} from "@racwa/react-components";
import LoadingIcons from "react-loading-icons";
import RacIcon from "../racicon/RacIcon";
import { ApiService } from "../../Services/api/api.service";
import { AuthService } from "../../Services/auth/auth.service";
import { iuser } from "@/app/Services/auth/iuser.interface";
import UserInfo from "../userinfo/UserInfo";

export default function Main() {
  //footer values and props
  const variant = "sidebar";
  const logoProps = {};
  const copyright = `This website is created by The Royal Automobile Club of WA (Inc.).
        © ${new Date().getFullYear()} The Royal Automobile Club of WA (Inc.).`;

  //authentication and api services to be used throuought the application
  const authService = new AuthService();
  const apiService = new ApiService(authService);
  //constant to keep the state of the userclaims object, provided by the auth service.
  const [userClaims, setUserClaims] = useState<iuser | null>(null);

  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  //functions for main to handle state changes in main when udated in a component.
  //example taken from the cashsettlement app where  till was updated in child component
  // const handleTillChange = (newTillId: string) => {
  //   setTillId(newTillId);
  // };

  //this code is run on page load.
  useEffect(
    () => {
      //set the user claims if the flag in config is true
      if (process.env.NEXT_PUBLIC_HAS_AUTH === "true") {
        authService.getToken().then((result) => {
          Promise.resolve(result).then((token) => {
            let claims = authService.userinfo();
            if (claims) {
              setUserClaims(claims);
            } else {
              console.log("User not authenticated");
              setUserClaims(null);
            }
          });
        });
      }
      fetchData();
    } /* eslint-disable-next-line */,
    [], //this array is the dependency array, if you have a variable that you want to watch for changes, you put it here. Left empty to prevent infinite loop
  );

  const fetchData = () => {
    setLoading(true);

    if (true) {
      //some precondition required before you can fetch data
      //fetch the data
      const id = 1;
      const api = `${process.env.NEXT_PUBLIC_API_URL}`;
      const url = `${api}/${id}`;
      apiService
        .get(url)
        .then((result) => {
          if (result === null || result === undefined) {
            setIsError(true);
            setErrorMessage("Custom Error messsage to display");
          } else if (result.errors && result.errors.length > 0) {
            if (
              result.errors[0].status === "NotFound" ||
              result.errors[0].status === "BadRequest"
            ) {
              setIsError(true);
              setErrorMessage("Custome error message.");
            } else if (result.errors[0].status === "Unauthorized") {
              setIsError(true);
              setErrorMessage(
                "Unauthorized access, please contact RAC Group IT if problem persists.",
              );
            } else if (result.errors[0].status === "InternalServerError") {
              setIsError(true);
              setErrorMessage(
                "Server error encountered, please contact RAC Group IT if problem persists.",
              );
            }
          } else if (result.data) {
            //work with your data here
            var attributes = result.data.attributes;
          } else {
            console.log(
              "result is in a different format than expected, you need to review that!",
            );
          }
        })
        .catch((error) => {
          setIsError(true);
          setErrorMessage(
            "Server error encountered, please contact RAC Group IT if problem persists.",
          );
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  return (
    <Grid container direction="column">
      <Grid item>
        <RacwaResponsiveHeader>
          <UserInfo userInfo={userClaims} />
        </RacwaResponsiveHeader>
      </Grid>
      <Grid item xs>
        <div>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "top",
                alignItems: "center",
                background: "white",
                padding: "5px",
              }}
            >
              <RacIcon />
            </Box>

            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "top",
                  alignItems: "center",
                }}
              >
                <Typography align="center" variant="h2">
                  <LoadingIcons.ThreeDots
                    height="20"
                    stroke="black"
                    fill="black"
                  />{" "}
                  Loading ...
                </Typography>
              </Box>
            ) : isError ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "top",
                  alignItems: "center",
                }}
              >
                <Typography variant="h3">
                  Error Component can go here
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "top",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h3">
                    Loaded component/s can go here
                  </Typography>
                </Box>
              </Stack>
            )}
          </Stack>
        </div>
      </Grid>
      <Grid item>
        <DataDrivenRacwaFooter variant={variant} copyright={copyright} />
      </Grid>
    </Grid>
  );
}
