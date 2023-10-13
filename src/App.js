import './App.css';
import {BrowserRouter, NavLink, Route, Routes} from "react-router-dom";
import Home from './Home';
import LibraryItem from "./Components/LibraryItem";
import {Avatar, Dropdown, Navbar} from "flowbite-react";
import * as PropTypes from "prop-types";
import {GoogleLogin, googleLogout, useGoogleLogin} from "@react-oauth/google";
import React, {useEffect, useState} from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Cookies from 'js-cookie';
import Category from "./Components/Category";

function Item(props) {
    return null;
}

Item.propTypes = {children: PropTypes.node};

function App() {
    const [profile, setProfile] = useState([]);
    const [bearerToken, setToken] = useState([]);

    const handleLoginSuccess = async (codeResponse) => {
        const token = codeResponse.credential;

        let accessToken = codeResponse.credential;
        localStorage.setItem('accessToken', accessToken);

        setToken(token);

        const decoded = jwt_decode(token);

        setProfile(decoded);

        Cookies.set('profile', JSON.stringify(decoded), {expires: 7});

        await axios.post("https://localhost:7171/api/Account/AddPerson", {
            sub: decoded.sub,
            name: decoded.name,
            email: decoded.email,
        });
    };

    const handleLoginFailure = (error) => {
        console.log('Login Failed:', error);
    };

    useEffect(() => {
        setProfile(null);

        const storedProfile = Cookies.get('profile');
        if (storedProfile) {
            setProfile(JSON.parse(storedProfile));
        }
    }, []);

    const logOut = () => {
        googleLogout();
        setProfile(null);

        Cookies.remove('profile');
    };

    return (
        <BrowserRouter>
            <div>
                <Navbar
                    fluid
                    rounded
                >
                    <Navbar.Brand href="/">
                        <img
                            alt="Flowbite React Logo"
                            className="mr-3 h-6 sm:h-9"
                            src="https://media.nu.nl/m/7t0x0caa6hj4_wd1280/nieuwe-musicalversie-van-shrek-volgend-jaar-op-nederlandse-planken.jpg"
                        />
                        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
              Mylo's library
        </span>
                    </Navbar.Brand>
                    <div className="flex md:order-2">
                        <Dropdown
                            arrowIcon={false}
                            inline
                            label={
                                <div
                                    className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                    {profile ? (
                                        <img
                                            src={profile.picture}
                                            alt="User settings"
                                            className="w-10 h-10 object-cover rounded-full"
                                        />
                                    ) : (
                                        <svg
                                            className="absolute w-12 h-12 text-gray-400 -left-1"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                clipRule="evenodd"
                                            ></path>
                                        </svg>
                                    )}
                                </div>
                            }
                        >
                        <Dropdown.Header>
                          <div>
                              {profile ? (
                                  <div>
                                      <span className="block text-sm">
                                          <p>{profile.name}</p>
                                     </span>
                                      <span className="block truncate text-sm font-medium">
                                          <p>{profile.email}</p>
                                      </span>

                                      <br/>

                                      <img src={profile.picture} alt="user image"/>

                                      <br/>
                                      <br/>
                                      <button onClick={logOut}>Log out</button>
                                  </div>
                              ) : (
                                  <GoogleLogin
                                      clientId="1011308093896-dbt400nb5vmr3ani5jte0begsbifmair.apps.googleusercontent.com"
                                      onSuccess={handleLoginSuccess}
                                      onError={handleLoginFailure}
                                      cookiePolicy={'single_host_origin'}
                                      isSignedIn={true}
                                  />
                              )}
                        </div>
                    </Dropdown.Header>
                    <Item>
                        Dashboard
                    </Item>
                    <Item>
                        Settings
                    </Item>
                    <Item>
                        Earnings
                    </Item>
                    <Dropdown.Divider/>
                    <Item>
                        Sign out
                    </Item>
                        </Dropdown>
                        <Navbar.Toggle/>
                    </div>
                    <Navbar.Collapse>
                        {profile ? (
                            <Navbar.Link href="/category">
                                Categories
                            </Navbar.Link>
                        ) : null}
                        {profile ? (
                        <Navbar.Link href="/libraryitem">
                            LibraryItems
                        </Navbar.Link>
                        ) : null}
                    </Navbar.Collapse>
                </Navbar>
                <Routes>
                    <Route path="/">
                        <Route path="home" element={<Home/>}/>
                        {profile ? (
                            <Route path="category" element={<Category profile={profile} bearerToken={bearerToken} />} />
                        ) : null}
                        {profile ? (
                            <Route path="libraryitem" element={<LibraryItem />} />
                        ) : null}
                    </Route>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
