import { Router, Request, Response } from "express";
const scraperRouter = Router();

import { GSRanking } from "../libs/interfaces";
import type { GoogleScholarAuthorParameters } from "serpapi";
import { getJson } from "serpapi";

// import serpiData from "../data/serpi.json";

scraperRouter.all("/", async (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

scraperRouter.get(
  "/:stringId/google-scholar",
  async (req: Request, res: Response) => {
    const stringId = req.params.stringId;

    const params: GoogleScholarAuthorParameters = {
      api_key: process.env.GOOGEL_SCHOLAR_API_KEY,
      hl: "en",
      start: 0,
      author_id: stringId,
      num: "1000",
    };

    // // Show result as JSON
    const response = await getJson("google_scholar_author", params);
    const { search_metadata, author } = response;
    if (search_metadata.status !== "Success") {
      res.status(200).json({
        status: false,
        err: "Invalid Google Scholar ID",
      });
    } else {
      const { articles, cited_by } = response;
      const { table, graph } = cited_by;

      const maxYear = Math.max(
        ...articles
          .filter((article: any) => article.year && article.year !== "null")
          .map((article: any) => parseInt(article.year))
      );

      const minYear = Math.min(
        ...articles
          .filter((article: any) => article.year && article.year !== "null")
          .map((article: any) => parseInt(article.year))
      );

      const totalPub = articles.length;

      const { citations } = table[0];
      const { h_index } = table[1];
      const { i10_index } = table[2];

      res.status(200).json({
        status: true,
        ranking: {
          googlePresence: 1,
          totalPublications: totalPub,
          firstPublicationYear: minYear,
          lastPublicationYear: maxYear,
          citations: citations.all,
          hindex: h_index.all,
          i10hindex: i10_index.all,
          authorMetadata: author,
          publications: articles,
          searchMetadata: response,
        } as GSRanking,
      });
    }
  }
);

export default scraperRouter;
