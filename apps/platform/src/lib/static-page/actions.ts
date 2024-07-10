"use server";
import { nanoid } from "nanoid";
import dbConnect from "src/lib/dbConnect";
import StaticPage, {
  RawStaticPage,
  StaticPageWithId,
} from "src/models/static-page";

export async function getStaticPageBySlug(
  slug: string
): Promise<StaticPageWithId> {
  await dbConnect();

  const staticPage = await StaticPage.findOne({ slug });

  return Promise.resolve(JSON.parse(JSON.stringify(staticPage)));
}

export async function getStaticPages(): Promise<StaticPageWithId[]> {
  await dbConnect();

  const staticPages = await StaticPage.find({});

  return Promise.resolve(JSON.parse(JSON.stringify(staticPages)));
}
export async function createStaticPage(
  data: RawStaticPage
): Promise<StaticPageWithId> {
  await dbConnect();

  const _staticPage = await StaticPage.findOne({ slug: data.slug });
  if (_staticPage) {
    const newPage = await StaticPage.create({
      ...data,
      slug: `${data.slug}-${nanoid()}`,
    });
    return Promise.resolve(JSON.parse(JSON.stringify(newPage)));
  }
  const newPage = await StaticPage.create(data);
  return Promise.resolve(JSON.parse(JSON.stringify(newPage)));
}

export async function updatePage(
  _id: string,
  data: RawStaticPage
): Promise<StaticPageWithId> {
  try {
    await dbConnect();

    const updatedPage = await StaticPage.findOneAndUpdate({ _id }, data, {
      new: true,
    });

    return Promise.resolve(JSON.parse(JSON.stringify(updatedPage)));
  } catch (e) {
    console.log(e);
    return Promise.reject(`some error occurred`);
  }
}
