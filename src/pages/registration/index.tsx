import { pxToRem } from "src/styles/px-to-rem";
import QrCodeGenerator from "src/components/QrCode/QrCodeGenerator";
import {
  TextField,
  Grid,
  Snackbar,
  createTheme,
  ThemeProvider,
  Alert,
} from "@mui/material";
import { claimSource, hostUrl, vaultUrl } from "src/lib/variables";
import { FC, use } from "react";
import Image from "next/image";
import styled from "styled-components";
import Box from "src/components/Box/Box";
import signInImage from "public/images/sign-in.png";
import axios from "axios";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { ToastProps } from "src/types/error";
import { useSession } from "next-auth/react";

const Wrapper = styled.div`
  min-height: 100%;
  padding: ${pxToRem(80)};
`;

const Container = styled(Box)`
  border: solid 1px #e1e2ef;
`;

const Logo = styled(Box)`
  width: ${pxToRem(400)};
`;

const LogInContainer = styled(Box)`
  width: ${pxToRem(507)};
`;

const InnerLogInContainer = styled(Box)`
  width: ${pxToRem(347)};
`;

const Title = styled.div`
  margin-top: ${pxToRem(40)};
  font-size: ${pxToRem(32)};
  font-family: "lora", sans-serif;
  font-weight: 700;

  div {
    line-height: 1;
    color: #ff5722;
  }
`;
const Content = styled.div`
  margin-top: ${pxToRem(24)};
  margin-bottom: ${pxToRem(32)};
  font-size: ${pxToRem(16)};
  font-family: "lato", sans-serif;
  font-weight: 400;
`;

const ButtonContainer = styled(Box)`
  margin-top: ${pxToRem(48)};
`;

const OrContainer = styled(Box)`
  color: #dedede;

  span {
    margin: 0 ${pxToRem(20)};
  }
`;

const Line = styled.div`
  width: 141px;
  height: 1px;
  background-color: #d2d2d2;
`;

const NoAccount = styled.div`
  margin-top: ${pxToRem(52)};
  margin-bottom: ${pxToRem(44)};
  font-family: "lato", sans-serif;
  font-size: ${pxToRem(14)};
`;

const Bold = styled.span`
  margin-left: ${pxToRem(8)};
  font-size: ${pxToRem(16)};
  font-family: "lato", sans-serif;
  font-weight: 700;
  color: #10375c;
`;

const Button = styled.button<{ variant: "primary" | "secondary" }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  padding: ${pxToRem(12)} ${pxToRem(24)};
  color: #ff5722;
  font-family: "lato", sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 16px 0 rgba(255, 87, 34, 0.32);

  button:nth-of-type(1) {
    margin-right: ${pxToRem(12)};
  }

  img {
    margin-right: ${pxToRem(16)};
  }

  ${({ variant }) =>
    variant === "primary"
      ? `
      background: #1d58fc;
      color:#fff;
      box-shadow: 0 4px 16px 0 rgba(255, 87, 34, 0.32);
      margin-top:${pxToRem(44)};
    `
      : `
      background: #ff5722;
      color: #fff;
      box-shadow: 0 4px 16px 0 rgba(255, 87, 34, 0.32);
      margin-bottom:${pxToRem(44)};
    `}
  ${({ variant }) =>
    variant === "secondary"
      ? `
        background: #1d58fc;
        color:#fff;
        box-shadow: 0 4px 16px 0 rgba(255, 87, 34, 0.32);
        margin-top:${pxToRem(44)};
      `
      : `
        background: #ff5722;
        color: #fff;
        box-shadow: 0 4px 16px 0 rgba(255, 87, 34, 0.32);
        margin-bottom:${pxToRem(44)};
      `}
`;
const theme = createTheme({
  typography: {
    fontSize: 28,
  },
});

type handleResponse = {
  credentialOfferUri: string;
  expiresIn: number;
  issuanceId: string;
  txCode: string;
  credential_issuer: string;
};

type RegistrationProps = {
  email: string | null | undefined;
  name?: string;
  phoneNumber?: string;
  dob?: string;
  gender?: string;
  address?: string;
  postcode?: string;
  city?: string;
  country?: string;
  holderDid: string | null | undefined;
  credentialTypeId?: string;
};

const defaults: RegistrationProps = {
  email: "",
  name: "",
  phoneNumber: "9980166067",
  dob: "20-10-1999",
  gender: "Male",
  address: "Bangalore",
  postcode: "560103",
  city: "Bangalore",
  country: "India",
  holderDid: "",
  credentialTypeId: "InsuranceRegistration",
};

const mockResp = {
  credentialOfferUri:
    "https://23cf675c-4625-40fc-a786-4ee37bc74bac.apse1.issuance.dev.affinidi.io/offers/62dd6470-bd7a-4935-9def-a59bc4d828bf",
  expiresIn: 15,
  issuanceId: "62dd6470-bd7a-4935-9def-a59bc4d828bf",
  txCode: "1111",
  credential_issuer:
    "https://23cf675c-4625-40fc-a786-4ee37bc74bac.apse1.issuance.dev.affinidi.io",
};

const Registration: FC = () => {
  const { push } = useRouter();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [issuanceResponse, setIssuanceResponse] = useState<handleResponse>();
  const [registration, setRegistration] = useState<RegistrationProps>(defaults);
  const [toast, setToast] = useState<ToastProps | false>();
  const [claimUrl, setClaimUrl] = useState<string>();
  const [isWaltId, setIsWaltId] = useState(claimSource == "walt.id");
  //Prefill available data from session, if user is logged-in
  const { data: session } = useSession();
  useEffect(() => {
    console.log("session", session);
    if (!session || !session.user) return;

    setRegistration((state) => ({
      ...state,
      email: session.user?.email,
      holderDid: session.userId,
    }));
  }, [session]);

  useEffect(() => {
    if (!issuanceResponse || !issuanceResponse.credentialOfferUri) return;

    let url = `${vaultUrl}=${issuanceResponse?.credentialOfferUri}`;
    if (isWaltId) {
      url = `openid-credential-offer://${issuanceResponse.credential_issuer.replace(
        "https://",
        ""
      )}/?credential_offer_uri=${encodeURIComponent(
        issuanceResponse.credentialOfferUri
      )}`;
    }
    setClaimUrl(url);
  }, [issuanceResponse]);

  const handleClose = () => {
    setIssuanceResponse(undefined);
    setIsButtonDisabled(false);
    setRegistration((state) => ({
      ...state,
      email: session?.user?.email,
      holderDid: session?.userId,
    }));
    push("/registration");
  };

  const handleOpen = () => {
    window.open(claimUrl, "_blank");
  };

  const handleRegistration = async () => {
    if (!registration.holderDid || !registration.email) {
      setToast({
        message:
          "Enter Mandatory Details or Please login to prefill the Mandatory Details",
        type: "error",
      });
      return;
    }
    console.log("Start Issuance");
    console.log("registration Details :", registration);
    setIsButtonDisabled(true);
    const apiData = {
      credentialData: {
        email: registration.email,
        name: registration.name,
        phoneNumber: registration.phoneNumber,
        dob: registration.dob,
        gender: registration.gender,
        address: registration.address,
        postcode: registration.postcode,
        city: registration.city,
        country: registration.country,
      },
      credentialTypeId: registration.credentialTypeId,
      holderDid: registration.holderDid,
    };
    console.log("apiData", apiData);
    const response = await axios<handleResponse>(
      `${hostUrl}/api/credentials/issuance-start`,
      {
        method: "POST",
        data: apiData,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let dataResponse = response.data;
    console.log("dataResponse", dataResponse);

    if (typeof dataResponse == "string") {
      dataResponse = JSON.parse(dataResponse);
    }

    setIssuanceResponse(dataResponse);

    setToast({
      message: "Insurance Registration Credentails Issued Successfully",
      type: "success",
    });
    console.log("issuanceResponse", issuanceResponse);
  };

  return (
    <ThemeProvider theme={theme}>
      {toast && toast.message && (
        <Snackbar
          open={!!toast.message}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          onClose={() => setToast(false)}
          message={"test"}
        >
          <Alert
            onClose={() => setToast(false)}
            severity={toast?.type || "info"}
            variant="filled"
            sx={{ width: "40%" }}
          >
            {toast.message || "test"}
          </Alert>
        </Snackbar>
      )}
      <Wrapper>
        <Container direction="row">
          <Logo direction="row" justifyContent="flex-start" flex={1}>
            <Image
              src={signInImage.src}
              alt="sign in"
              width={777}
              height={487}
              style={{ objectFit: "cover" }}
            />
          </Logo>
          {!issuanceResponse && (
            <LogInContainer
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <InnerLogInContainer style={{ width: "80%" }}>
                <Title>Insurance Registration</Title>
                <Content>Let's move ahead with your personal details</Content>

                <Grid item xs={12}>
                  <TextField
                    label="Holder's DID *"
                    variant="standard"
                    fullWidth
                    margin="normal"
                    InputProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    InputLabelProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    value={registration.holderDid}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegistration((p) => ({
                        ...p,
                        holderDid: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Email *"
                    variant="standard"
                    fullWidth
                    margin="normal"
                    inputProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    InputLabelProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    value={registration.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegistration((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Full Name"
                    variant="standard"
                    fullWidth
                    margin="normal"
                    inputProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    InputLabelProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    value={registration.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegistration((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Phone Number"
                    variant="standard"
                    fullWidth
                    margin="normal"
                    inputProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    InputLabelProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    value={registration.phoneNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegistration((p) => ({
                        ...p,
                        phoneNumber: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Date of Birth"
                    variant="standard"
                    fullWidth
                    margin="normal"
                    inputProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    InputLabelProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    value={registration.dob}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegistration((p) => ({ ...p, dob: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Gender"
                    variant="standard"
                    fullWidth
                    margin="normal"
                    inputProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    InputLabelProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    value={registration.gender}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegistration((p) => ({ ...p, gender: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Address"
                    variant="standard"
                    fullWidth
                    margin="normal"
                    inputProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    InputLabelProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    value={registration.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegistration((p) => ({
                        ...p,
                        address: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Post Code"
                    variant="standard"
                    fullWidth
                    margin="normal"
                    inputProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    InputLabelProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    value={registration.postcode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegistration((p) => ({
                        ...p,
                        postcode: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="City"
                    variant="standard"
                    fullWidth
                    margin="normal"
                    inputProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    InputLabelProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    value={registration.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegistration((p) => ({ ...p, city: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Country"
                    variant="standard"
                    fullWidth
                    margin="normal"
                    inputProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    InputLabelProps={{
                      style: { fontSize: "2rem" }, // change the value as needed
                    }}
                    value={registration.country}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRegistration((p) => ({
                        ...p,
                        country: e.target.value,
                      }))
                    }
                  />
                </Grid>

                <ButtonContainer direction="column">
                  <Button
                    variant="secondary"
                    onClick={handleRegistration}
                    disabled={isButtonDisabled}
                  >
                    Submit
                  </Button>
                </ButtonContainer>
              </InnerLogInContainer>
            </LogInContainer>
          )}

          {issuanceResponse && (
            <LogInContainer
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <InnerLogInContainer style={{ width: "80%" }}>
                <Title>Registration Credential Offer</Title>
                {isWaltId && (
                  <Content>
                    Steps to claim VC offer on <b>walt.id</b>
                    <ol style={{ listStyle: "decimal", paddingLeft: "2rem" }}>
                      <li>
                        Click on below button will copy the offer URL and open
                        walt.id wallet
                      </li>
                      <li>Select your wallet by clicking on "View Wallet"</li>
                      <li>
                        Navigate to "Credentials" menu and Click on "scan to
                        receive or present credential" button
                      </li>
                      <li>
                        Paste the copied offer url and click on "Receive
                        Credential" button
                      </li>
                      <li>
                        Select your appropirate DID method which it was issued
                        to and click on "Accept" button
                      </li>
                      <li>Hurray, you have got your VC into your wallet</li>
                    </ol>
                  </Content>
                )}
                <Content style={{ margin: "0.5rem 0" }}>
                  <b>{claimUrl}</b>
                </Content>
                <Content style={{ margin: "2rem 0" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {claimUrl && <QrCodeGenerator qrCodeData={claimUrl} />}
                  </div>
                </Content>
                <Content style={{ margin: "0.5rem 0", fontSize: "20px" }}>
                  {issuanceResponse.txCode && (
                    <b>Your Transaction Code: {issuanceResponse.txCode}</b>
                  )}
                </Content>
                <Content
                  style={{ margin: "0.5rem 0", color: "red", fontSize: "20px" }}
                >
                  <b>Offer Timeout in {issuanceResponse.expiresIn} Second</b>
                </Content>
                {!isWaltId && (
                  <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    spacing={2}
                  >
                    <Grid item flex={1}>
                      <ButtonContainer>
                        <Button variant="secondary" onClick={handleOpen}>
                          Accept
                        </Button>
                      </ButtonContainer>
                    </Grid>
                    <Grid item flex={1}>
                      <ButtonContainer>
                        <Button variant="primary" onClick={handleClose}>
                          Deny
                        </Button>
                      </ButtonContainer>
                    </Grid>
                  </Grid>
                )}
                {isWaltId && claimUrl && (
                  <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    spacing={2}
                  >
                    <Grid item flex={1}>
                      <ButtonContainer>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            navigator.clipboard.writeText(claimUrl);
                            window.open(
                              `https://wallet.walt.id/login`,
                              "_blank"
                            );
                          }}
                        >
                          Copy Url & Open Walt.id
                        </Button>
                        
                      </ButtonContainer>
                    </Grid>
                    <Grid item flex={1}>
                      <ButtonContainer>
                        <Button variant="primary" onClick={handleClose}>
                          Reset
                        </Button>
                      </ButtonContainer>
                    </Grid>
                  </Grid>
                )}
              </InnerLogInContainer>
            </LogInContainer>
          )}
        </Container>
      </Wrapper>
    </ThemeProvider>
  );
};

export default Registration;
