const login_api = async (username, password, success, fail) => {
  const response = await fetch(
    `/api/token/`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "username": username,
        "password": password,
      })
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["detail"])
  }
};

const do_token_not_valid = async () => {
  await localStorage.removeItem("userToken");
  await localStorage.removeItem("loggedInUsername");
  console.log("Token not valid");
  window.location = "/login";
};

const getLoggedInUsername = async (funcCall) => {
  const loggedInUsername = await localStorage.getItem("loggedInUsername");
  funcCall(loggedInUsername);
};

const getPageLanguage = async (funcCall) => {
  const pageLanguage = "en"; // await localStorage.getItem("pageLanguage") || "en";
  funcCall(pageLanguage);
};

const setLocalStorageLanguage = async (lang) => {
  await localStorage.setItem("pageLanguage", lang);
}

const register_api = async (userInfo, success, fail) => {
  const response = await fetch(
    `/api/register/`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo)
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["detail"])
  }
};

const validate_user_api = async (userInfo, success, fail) => {
  const response = await fetch(
    `/api/validate/`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInfo)
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["detail"])
  }
};

const resend_email_api = async (email, success) => {
  const response = await fetch(
    `/api/send_mail/`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ "email": email })
    }
  );
  const text = await response.text();
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)["detail"])
  }
};

const store_lyric_api = async (allParagraphs, lyricsId, success, fail) => {
  success({
    'data': { 'id': 123 }
  });
  return;
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const path = lyricsId == null ? `/api/lyrics/` : `/api/lyrics/${lyricsId}/`;
  const response = await fetch(
    path,
    {
      method: lyricsId == null ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ allParagraphs })
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 201 || response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};


const add_rows_to_spreadsheet_api = async (spreadsheetId, data_json, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/collections/${spreadsheetId}/`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data_json)
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)["data"]);
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};



const get_all_collections_api = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/collections/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};


const get_lyric_data_api = async (lyric_id, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/lyrics/${lyric_id}/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const get_spreadsheet_dashboard_api = async (spreadsheetId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/collections/${spreadsheetId}/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const do_get_custom_graph_api = async (spreadsheetId, graphData, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/collections/${spreadsheetId}/custom-graph/?` + new URLSearchParams(graphData),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};


const get_spreadsheet_table_api = async (spreadsheetId, page, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/collections/${spreadsheetId}/view-table?page_no=${page}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const get_user_data_api = async (success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/user_info/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
  }
};

const delete_collection_api = async (spreadsheetId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/collections/${spreadsheetId}/`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  console.log(response.status);
  if (response.status === 410) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    Object.entries(JSON.parse(text)).forEach(([key, value]) => {
      fail(`${key}: ${value}`);
    });
  }
};

function doIfEscapePressed(event, funcCall) {
  event = event || window.event;
  var key = event.which || event.key || event.keyCode;
  if (key === 27) { // escape
    funcCall();
  }
};

const ask_question_api = async (message, collectionId, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/ask_question/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message, collectionId })
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    fail(JSON.parse(text));
  }
};


// SHARING

const share_spreadsheet_api = async (email, spreadsheetId, success, fail) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/collections/${spreadsheetId}/share/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        "email": email,
      })
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text)['data']);
  } else {
    console.log("failed", text);
    fail(JSON.parse(text)['detail']);
  }
};

const unshare_spreadsheet_api = async (userId, spreadsheetId, success) => {
  const token = await localStorage.getItem("userToken");
  if (token === null) {
    console.log("No credentials found, redirecting...");
    window.location = "/login";
    return [];
  }
  const response = await fetch(
    `/api/collections/${spreadsheetId}/user/${userId}/unshare/`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'Application/JSON',
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const text = await response.text();
  if (response.status === 401) {
    do_token_not_valid();
    return [];
  }
  if (response.status === 200) {
    console.log("success", JSON.parse(text));
    success(JSON.parse(text));
  } else {
    console.log("failed", text);
    Object.entries(JSON.parse(text)).forEach(([key, value]) => {
      fail(`${key}: ${value}`);
    });
  }
};