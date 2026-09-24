import { makeLegalPage } from "@/lib/legal";

const page = makeLegalPage("affiliate-disclosure");
export const generateMetadata = page.generateMetadata;
export default page.Page;
