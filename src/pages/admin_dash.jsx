import { AppBar, Card, Container, Stack, Typography } from "@mui/material";
import { Navigate, Outlet, useNavigate } from "react-router";
import { getAuth, signInAnonymously } from "firebase/auth"
import { useEffect, useState, useRef } from "react";
import { app, db } from "../main";
import { child, get, ref } from "firebase/database";



export default function AdminDashboard() {
    const auth = getAuth(app);
    const navigate = useNavigate();
    const [firebaseStatus, setFirebaseStatus] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const [login, setLogin] = useState(true);
    const isAuthCalled = useRef(false);

    useEffect(() => {
        if (isAuthCalled.current) return;
        isAuthCalled.current = true;

        signInAnonymously(auth)
            .then(() => {
                setFirebaseStatus(true);

                const userAuth = {
                    userName: localStorage.getItem("authUsername"),
                    password: localStorage.getItem("authPassword"),
                    timeStamp: localStorage.getItem("authKeyframe")
                }
                console.log(userAuth);

                if (userAuth.userName == null || userAuth.password == null) {
                    navigate("/admin/login");
                    return;
                }
                else {
                    const dbRef = ref(db);
                    get(child(dbRef, 'admin')).then((snapshot) => {
                        if (snapshot.exists()) {
                            const adminDb = snapshot.val();
                            let isValid = false;

                            for (const value of Object.values(adminDb)) {
                                if (
                                    value.username === userAuth.userName &&
                                    value.password === userAuth.password &&
                                    parseInt(userAuth.timeStamp) >= Date.now() - 1000 * 60 * 60
                                ) {
                                    console.log("Login correct");
                                    isValid = true;
                                    break;
                                }
                            }

                            setLogin(isValid);
                        } else {
                            setLogin(false);
                        }
                    })
                }
            })
            .catch((e) => {
                setFirebaseStatus(false);
                setErrorMsg(e.code);
            })
    }, []);

    useEffect(() => {
        if (!login) {
            localStorage.removeItem("authUsername")
            localStorage.removeItem("authPassword")
            navigate("/admin/login")
        }
    }, [login]);

    useEffect(() => {
        const checkSession = () => {
            const timeStamp = localStorage.getItem("authKeyframe");

            if (!timeStamp) {
                navigate("/admin/login");
                return;
            }

            if (parseInt(timeStamp) < Date.now() - 1000 * 60 * 60) {
                console.log("Session expired. Logging out...");
                localStorage.removeItem("authUsername");
                localStorage.removeItem("authPassword");
                localStorage.removeItem("authKeyframe");
                navigate("/admin/login");
            }
        };


        const interval = setInterval(checkSession, 60 * 1000);

        // Also check immediately when component mounts
        checkSession();

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        (firebaseStatus == true) ?
            <Stack>
                <AppBar
                    position="fixed"
                    sx={{
                        padding: 2,
                        background: 'RGB(30,30,40)',
                    }}
                >
                    <Typography variant="h5" textAlign="center">
                        Wi-Fi Koin Admin
                    </Typography></AppBar>
                <Outlet />
            </Stack> :
            <Stack direction="column" justifyContent="center">
                <Typography variant="h6" color="red">Firebase auth error: {errorMsg}</Typography>
            </Stack>
    )
}