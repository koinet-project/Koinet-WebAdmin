import { Alert, Button, Card, Container, Divider, FormControl, Input, InputAdornment, InputLabel, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { child, get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../main";
import { Navigate, useNavigate } from "react-router";

export default function LoginUI() {
    const [passwordVisibility, setPasswordVisibility] = useState(false);

    var [username, setUserName] = useState("");
    var [password, setPassword] = useState("");

    const [openErrorAlert, setOpenErrorAlert] = useState(false);

    const navigate = useNavigate();

    function tryLogin() {
        const dbRef = ref(db);
        get(child(dbRef, 'admin')).then((snapshot) => {
            var adminDb = null;
            let loggedIn = false;

            if (snapshot.exists()) {
                adminDb = snapshot.val()

                for (const [_, value] of Object.entries(adminDb)) {
                    if (
                        value.username == username &&
                        value.password == password
                    ) {
                        localStorage.setItem("authUsername", username),
                            localStorage.setItem("authPassword", password)
                        localStorage.setItem("authKeyframe", Date.now())
                        navigate('/admin')
                        loggedIn = true;
                        break;
                    }
                }
            }
            if (!loggedIn) {
                setOpenErrorAlert(true);
            }
        }).catch((error) => {
            console.error("Error fetching admin data:", error);
            setOpenErrorAlert(true);
        }) 
    }

    const handleCloseErrorAlert = (event, reason) => {
        if (reason === 'clickway') {
            return;
        }
        setOpenErrorAlert(false);
    };

    const handlePressKey = (event) => {
        if (event.key === 'Enter') {
            tryLogin();
        }
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: "center",
            alignItems: "center",
            minHeight: '100vh',
        }}>

            <Card sx={{ padding: 2, }} >
                <Stack spacing={3}>
                    <Typography variant="h6" fontWeight={600} textAlign="center">Login</Typography>
                    <Stack>
                        <InputLabel>Username</InputLabel>
                        <TextField
                            id="username"
                            value={username}
                            onChange={(event) => {
                                setUserName(event.target.value);
                            }}
                            onKeyDown={handlePressKey}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <span className="material-symbols-outlined">account_circle</span>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Stack>
                    <Stack>
                        <InputLabel>Password</InputLabel>
                        <TextField
                            id="password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                            }}
                            onKeyDown={handlePressKey}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <span className="material-symbols-outlined">key</span>
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end" >
                                            <span className="material-symbols-outlined" onClick={() => { setPasswordVisibility(!passwordVisibility) }}>
                                                {(passwordVisibility) ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </InputAdornment>
                                    )
                                }
                            }}
                            type={(passwordVisibility) ? 'text' : 'password'}
                        />
                    </Stack>
                    <Button variant="contained" onClick={tryLogin}>Login</Button>
                </Stack>
            </Card>

            {/* Snackbar for error message */}
            <Snackbar open={openErrorAlert} autoHideDuration={6000} onClose={handleCloseErrorAlert}>
                <Alert onClose={handleCloseErrorAlert} severity="error" sx={{ width: '100%' }}>
                    Username dan password salah
                </Alert>
            </Snackbar>
        </div>
    )
}