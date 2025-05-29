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
