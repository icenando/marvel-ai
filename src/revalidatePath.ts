const revalidatePath = async () => {
  const revalidateUrl = process.env.REVALIDATE_URL;
  await fetch(revalidateUrl).then(response => {
    if (response.status !== 200) {
      console.error("Failed to revalidate path");
      throw response.json();
    }
    console.info("Path revalidated successfully");
    console.info(response.json());
  });
};
