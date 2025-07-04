export async function getRequest(currentUrl) {
  try {
    const response = await fetch(`http://localhost:3001/${currentUrl}`,{ credentials: 'include',});
    if (!response.ok) {
      throw new Error(response.status);
    }
    const data = await response.json();
    return { succeeded: true, data };
  } catch (error) {
    let status = error;
    if (error instanceof Error && !isNaN(Number(error.message))) {
      status = Number(error.message);
    }
    return { succeeded: false, status: status };
  }
}
export async function deleteRequest(currentUrl) {
  try {
    const response = await fetch(`http://localhost:3001/${currentUrl}`,{
       method: 'DELETE',
        credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      }});
    if (!response.ok) {
      throw new Error(response.status);
    }
    const data = await response.json();
    return { succeeded: true};
  } catch (error) {
    let status = error;
    if (error instanceof Error && !isNaN(Number(error.message))) {
      status = Number(error.message);
    }
    return { succeeded: false ,status:status };
  }
}
export async function postRequest(currentUrl, data) {
  try {
    
    const response = await fetch(`http://localhost:3001/${currentUrl}`, {
      method: 'POST',
        credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(response.status);
    }
    const responseData = await response.json();
    return { succeeded: true, data: responseData };
  } catch (error) {
    let status = error;
    if (error instanceof Error && !isNaN(Number(error.message))) {
      status = Number(error.message);
    }
    return { succeeded: false, status: status };
  }
}
export async function putRequest(currentUrl, data) {
  try {
    console.log(currentUrl)
    const response = await fetch(`http://localhost:3001/${currentUrl}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(response.status);
    }
    const responseData = await response.json();
    return { succeeded: true, data: responseData };
  } catch (error) {
      let status = error;
  if (error instanceof Error && !isNaN(Number(error.message))) {
    status = Number(error.message);
  }
    return { succeeded: false, status: status };
  }
}
