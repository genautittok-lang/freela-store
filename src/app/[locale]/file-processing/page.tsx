import { makeLegalPage } from "@/lib/legal";

const page = makeLegalPage("file-processing");
export const generateMetadata = page.generateMetadata;
export default page.Page;
