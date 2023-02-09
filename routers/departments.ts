// api routes
import { dbCon } from "../models";
import { Router, Request, Response } from "express";
const departmentsRouter = Router();

departmentsRouter.all("/", (req: Request, res: Response) => {
  res.send({
    status: false,
    error: "Invalid API GET call",
  });
});

// List departments
departmentsRouter.get("/list", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { Departments } = await dbCon();
  const department = await Departments.find({}).catch(catcher);
  if (department) {
    res.status(200).json({
      status: true,
      data: department,
    });
  } else {
    res.status(404).json({ status: false, err: "Departments not found" });
  }
});

// Count departments//
departmentsRouter.get("/count", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { Departments } = await dbCon();
  const total = await Departments.countDocuments({}).catch(catcher);
  if (total) {
    res.status(200).json({
      status: true,
      total: total,
    });
  } else {
    res.status(404).json({ status: false, err: "Departments not found" });
  }
});

// get general department info with id
departmentsRouter.get("/info/:id", async (req: Request, res: Response) => {
  const catcher = (error: Error) =>
    res.status(400).json({ status: 0, error: error });
  const { id } = req.params;
  const { Departments } = await dbCon();
  const department = await Departments.findOne({ _id: id }).catch(catcher);
  if (department) {
    res.status(200).json({
      status: true,
      data: department,
    });
  } else {
    res
      .status(404)
      .json({ status: false, err: "Department not found", data: {} });
  }
});

departmentsRouter.post(
  "/:schoolId/add",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const { schoolId } = req.params;
    const { name, facultyId, accredited } = req.body;
    const { Departments } = await dbCon();
    const department = await Departments.create({
      schoolId: schoolId,
      faculty: facultyId,
      accredited: accredited,
      name: name,
    }).catch(catcher);
    if (department) {
      res.status(200).json({
        status: true,
        ...department,
      });
    } else {
      res
        .status(404)
        .json({ status: false, err: "Department creation failed" });
    }
  }
);

//Add department
departmentsRouter.post(
  "/:schoolId/addDepartment",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const { schoolId } = req.params;
    const {
      facultyId,
      departmentId,
      departmentName,
      departmentCode,
      departmentDescription,
    } = req.body;
    const { SchoolDepartments, Departments } = await dbCon();
    if (departmentId) {
      //Edit existing department
      const department = await SchoolDepartments.findOne({
        schoolId: schoolId,
        departmentId: departmentId,
        facultyId: facultyId,
      }).catch(catcher);
      if (department) {
        res.status(200).json({
          status: true,
          ...department,
        });
      } else {
        const created = await SchoolDepartments.create({
          schoolId: schoolId,
          facultyId: facultyId,
          departmentId: departmentId,
          departmentName: departmentName,
          departmentCode: departmentCode,
          departmentDescription: departmentDescription
            ? departmentDescription
            : "",
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
      //Create new department globally and add to school
      const created = await Departments.create({
        name: departmentName,
        shortname: departmentCode,
        description: departmentDescription ? departmentDescription : "",
      }).catch(catcher);
      if (created) {
        // Add department to school
        const createdSchoolDepartment = await SchoolDepartments.create({
          schoolId: schoolId,
          facultyId: facultyId,
          departmentId: created._id,
          departmentName: departmentName,
          departmentCode: departmentCode,
          departmentDescription: departmentDescription
            ? departmentDescription
            : "",
        }).catch(catcher);
        if (createdSchoolDepartment) {
          res.status(200).json({
            status: true,
            ...createdSchoolDepartment,
          });
        } else {
          res
            .status(404)
            .json({ status: false, err: "Department creation failed" });
        }
      } else {
        res
          .status(404)
          .json({ status: false, err: "Department creation failed" });
      }
    }
  }
);

//List departments of a school
departmentsRouter.get(
  "/:schoolId/list",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const { schoolId } = req.params;
    const { SchoolDepartments } = await dbCon();
    const department = await SchoolDepartments.find({
      schoolId: schoolId,
    }).catch(catcher);
    if (department) {
      res.status(200).json({
        status: true,
        data: department,
      });
    } else {
      res.status(404).json({ status: false, err: "Departments not found" });
    }
  }
);

// Department Stats
departmentsRouter.get(
  "/:schoolId/stats",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const { schoolId } = req.params;
    const { SchoolDepartments } = await dbCon();

    const departments: any = await SchoolDepartments.aggregate([
      {
        $match: {
          schoolId: String(schoolId),
        },
      },
      {
        $group: {
          _id: 0,
          totalDepartments: { $sum: 1 },
          fullAccreditation: {
            $sum: {
              $cond: [{ $eq: ["$fullAccreditation", true] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalDepartments: 1,
          fullAccreditation: 1,
        },
      },
    ]).catch(catcher);

    res.status(200).json({
      status: true,
      ...departments[0],
    });
  }
);

// Update Department
departmentsRouter.post(
  "/:schoolId/updateDepartment",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const { schoolId } = req.params;
    const { _id, departmentName, departmentCode, departmentDescription } =
      req.body;
    const { SchoolDepartments } = await dbCon();
    const saved = await SchoolDepartments.findOneAndUpdate(
      {
        _id: _id,
        schoolId: schoolId,
      },
      {
        departmentName: departmentName,
        departmentCode: departmentCode,
        departmentDescription: departmentDescription,
      }
    ).catch(catcher);
    if (saved) {
      res.status(200).json({
        status: true,
        ...saved,
      });
    } else {
      res
        .status(404)
        .json({ status: false, err: "Department Updating failed" });
    }
  }
);

// List departments from schoolId and facultyId
departmentsRouter.get(
  "/:schoolId/faculties/:facultyId/list",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const { schoolId, facultyId } = req.params;
    const { SchoolDepartments } = await dbCon();
    const departments = await SchoolDepartments.find({
      schoolId: schoolId,
      facultyId: facultyId,
    }).catch(catcher);
    if (departments) {
      res.status(200).json({
        status: true,
        data: departments,
      });
    } else {
      res.status(404).json({ status: false, err: "Faculties not found" });
    }
  }
);

// Delete department from schoolId and facultyId
departmentsRouter.post(
  "/:schoolId/faculties/:facultyId/departments/:departmentId/removeDepartment",
  async (req: Request, res: Response) => {
    const catcher = (error: Error) =>
      res.status(400).json({ status: 0, error: error });
    const { departmentId } = req.params;
    const { SchoolDepartments } = await dbCon();
    const removed = await SchoolDepartments.findOneAndRemove({
      _id: departmentId,
    }).catch(catcher);
    if (removed) {
      res.status(200).json({
        status: true,
        ...removed,
      });
    } else {
      res
        .status(404)
        .json({ status: false, err: "Department deletion failed" });
    }
  }
);

export default departmentsRouter;