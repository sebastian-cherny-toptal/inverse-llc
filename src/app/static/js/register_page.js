'use strict';
const e = React.createElement;

function App() {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [registrationRandomCode, setRegistrationRandomCode] = React.useState(null);
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState("");

  const success = async (text) => {
    setRegistrationRandomCode(text.registration_random_code)
  };

  const isValid = (mail) => {
    return mail.match(".+@.+\\\..+") != null;
  }

  const checkIsEmpty = () => {
    if (!username) {
      setMessage("* Username is required");
      return true;
    }
    if (!isValid(email)) {
      setMessage("* Email is invalid");
      return true;
    }
    if (!password) {
      setMessage("* Password is required");
      return true;
    }
    return false;
  }

  const tryRegister = async (e) => {
    e.preventDefault();
    if (checkIsEmpty()) {
      return;
    }
    await register_api({
      email, password, username
    }, success, (text) => { setMessage(text) });
  };

  if (localStorage.getItem("userToken") != null) {
    window.location = window.location.origin + "/profile";
  }

  // In first div style: boxShadow: "5px 5px 20px #cccccccc",
  if (registrationRandomCode != null) {
    return (
      <div>
        <AppHeader />
        <div style={{
          width: "400px", margin: "auto", marginTop: "200px",
          padding: "1em", color: "#ffffff"
        }}>
          <label>Congratulations! </label>
          <br></br>
          <label>Your user was created. Check your email to finish registration.</label>
          <label>Or, for now, just go to this <a style={{ color: "#ffffff" }} href={"/welcome/" + registrationRandomCode}>link</a>.</label>
        </div>
      </div>
    )
  }
  return (
    <div>
      <AppHeader />
      <div style={{
        width: "400px", margin: "auto", marginTop: "200px",
        padding: "1em"
      }}>
        <form>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input autoFocus type="text" className="form-control" id="username" placeholder="username"
              onChange={(e) => { setUsername(e.target.value) }} value={username}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input autoFocus type="text" className="form-control" id="email" placeholder="email"
              onChange={(e) => { setEmail(e.target.value) }} value={email}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" placeholder="password"
              onChange={(e) => { setPassword(e.target.value) }} value={password}
              style={{ width: "60%" }} />
          </div>
          <div style={{ margin: "1em", color: "#ffffff" }}>{message}</div>
          <div style={{ margin: "1em" }}>
            <button type="submit" style={{
              marginLeft: "inherit", marginTop: "inherit",
              backgroundColor: "#434575", borderColor: "#434575"
            }} className="btn btn-primary" onClick={tryRegister}>Register</button>
          </div>
          <div style={{ margin: "1em" }}>
            <label style={{ marginTop: "inherit" }}>
              Already have a user? <a id="login_btn" href="/login">Login</a>
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);

