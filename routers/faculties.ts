// api routes
import { dbCon } from "../models";
import { Router, Request, Response } from "express";
const facultiesRouter = Router();

facultiesRouter.all("/", (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

// List faculties
facultiesRouter.get("/list", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { Faculties } = await dbCon();
  const faculties = await Faculties.find({}).catch(catcher);
  if (faculties) {
    res.status(200).json({
      status: true,
      data: faculties,
    });
  } else {
    res.status(404).json({ status: false, err: "Faculties not found" });
  }
});

// Count faculties//
facultiesRouter.get("/count", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { Faculties } = await dbCon();
  const total = await Faculties.countDocuments({}).catch(catcher);
  if (total) {
    res.status(200).json({
      status: true,
      total: total,
    });
  } else {
    res.status(404).json({ status: false, err: "faculties not found" });
  }
});

// get general department info with id
facultiesRouter.get("/info/:id", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { id } = req.params;
  const { Faculties } = await dbCon();
  const faculty = await Faculties.findOne({ _id: id }).catch(catcher);
  if (faculty) {
    res.status(200).json({
      status: true,
      data: faculty,
    });
  } else {
    res
      .status(404)
      .json({ status: false, err: "Department not found", data: {} });
  }
});

// Create Faculty
facultiesRouter.post("/:schoolId/add", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { schoolId } = req.params;
  const { name } = req.body;
  console.log(name);
  const { SchoolFaculties } = await dbCon();
  const faculty = await SchoolFaculties.create({
    schoolId: schoolId,
    name: name,
  }).catch(catcher);
  if (faculty) {
    res.status(200).json({
      status: true,
      ...faculty,
    });
  } else {
    res.status(404).json({ status: false, err: "Faculty creation failed" });
  }
});

facultiesRouter.post(
  "/:schoolId/addFaculty",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const { schoolId } = req.params;
    const { facultyId, facultyName, facultyCode, facultyDescription } =
      req.body;
    const { SchoolFaculties, Faculties } = await dbCon();
    if (facultyId) {
      //Edit existing faculty
      const faculty = await SchoolFaculties.findOne({
        schoolId: schoolId,
        facultyId: facultyId,
      }).catch(catcher);
      if (faculty) {
        res.status(200).json({
          status: true,
          ...faculty,
        });
      } else {
        const created = await SchoolFaculties.create({
          schoolId: schoolId,
          facultyId: facultyId,
          facultyName: facultyName,
          facultyCode: facultyCode,
          facultyDescription: facultyDescription ? facultyDescription : "",
        }).catch(catcher);
        if (created) {
          res.status(200).json({
            status: true,
            ...created,
          });
        } else {
          res
            .status(404)
            .json({ status: false, err: "Faculty creation failed" });
        }
      }
    } else {
      //Create new faculty globally and add to school
      const created = await Faculties.create({
        name: facultyName,
        shortname: facultyCode,
        description: facultyDescription ? facultyDescription : "",
      }).catch(catcher);
      if (created) {
        // Add faculty to school
        const createdSchoolFaculty = await SchoolFaculties.create({
          schoolId: schoolId,
          facultyId: created._id,
          facultyName: facultyName,
          facultyCode: facultyCode,
          facultyDescription: facultyDescription ? facultyDescription : "",
        }).catch(catcher);
        if (createdSchoolFaculty) {
          res.status(200).json({
            status: true,
            ...createdSchoolFaculty,
          });
        } else {
          res
            .status(404)
            .json({ status: false, err: "Faculty creation failed" });
        }
      } else {
        res.status(404).json({ status: false, err: "Faculty creation failed" });
      }
    }
  }
);

// List faculties under schoolId //
facultiesRouter.get("/:schoolId/list", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { schoolId } = req.params;
  const { SchoolFaculties } = await dbCon();
  const faculties = await SchoolFaculties.find({
    schoolId: schoolId,
  }).catch(catcher);
  if (faculties) {
    res.status(200).json({
      status: true,
      data: faculties,
    });
  } else {
    res.status(404).json({ status: false, err: "Faculties not found" });
  }
});

// removeFaculty
facultiesRouter.post(
  "/:schoolId/removeFaculty",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const { schoolId } = req.params;
    const { facultyId } = req.body;
    const { SchoolFaculties } = await dbCon();
    const removed = await SchoolFaculties.findOneAndRemove({
      schoolId: schoolId,
      facultyId: facultyId,
    }).catch(catcher);
    if (removed) {
      res.status(200).json({
        status: true,
        ...removed,
      });
    } else {
      res.status(404).json({ status: false, err: "Faculty deletion failed" });
    }
  }
);

//updateFaculty
facultiesRouter.post(
  "/:schoolId/updateFaculty",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const { schoolId } = req.params;
    const { facultyId, facultyName, facultyCode, facultyDescription } =
      req.body;
    const { SchoolFaculties } = await dbCon();
    const updated = await SchoolFaculties.findOneAndUpdate(
      {
        facultyId: facultyId,
        schoolId: schoolId,
      },
      {
        facultyName: facultyName,
        facultyCode: facultyCode,
        facultyDescription: facultyDescription,
      }
    ).catch(catcher);
    if (updated) {
      res.status(200).json({
        status: true,
        ...updated,
      });
    } else {
      res.status(404).json({ status: false, err: "Faculty Updating failed" });
    }
  }
);

// stat//
facultiesRouter.get("/:schoolId/stat", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { schoolId } = req.params;
  const { SchoolFaculties } = await dbCon();
  const count = await SchoolFaculties.count({
    schoolId: schoolId,
  }).catch(catcher);
  res.status(200).json({
    status: true,
    count: count,
  });
});
