export async function getRequest(currentUrl) {
  try {
    const response = await fetch(`http://localhost:3001/${currentUrl}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return { succeeded: true, data };
  } catch (error) {
    console.error("Error in getRequest:", error);
    return { succeeded: false, error: error.message || "Unknown error" };
  }
}
export async function postRequest(currentUrl, data) {
  try {
    console.log("Sending POST request to:", currentUrl, "with data:", data);
    
    const response = await fetch(`http://localhost:3001/${currentUrl}`, {
      method: 'POST',
        credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    return { succeeded: true, data: responseData };
  } catch (error) {
    console.error("Error in postRequest:", error);
    return { succeeded: false, error: error.message || "Unknown error" };
  }
}
