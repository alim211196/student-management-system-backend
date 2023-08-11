const express = require("express");
const nodemailer = require("nodemailer");
const router = new express.Router();
const Students = require("../models/students");
const User = require("../models/user");
const Contact = require("../models/contact");
const Reply = require("../models/reply");
const Attendance = require("../models/attendance");
const OTPModel = require("../models/otp_model");
const Course = require("../models/courses");
const generateEmailTemplate = require("../emailTemplate");
// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: "Alim.Mohammad619@outlook.com",
    pass: "Mc@2020!$",
  },
});

const generateOTP = () => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const insertOTP = async (email, otp) => {
  try {
    const otpData = {
      email,
      otp: otp.toString(),
    };
    await OTPModel.create(otpData);
    return true; // Indicate successful insertion
  } catch (error) {
    console.error("Error saving OTP:", error);
    return false; // Indicate failure
  }
};

const verifyOTP = async (email, otp) => {
  try {
    const storedOTP = await OTPModel.findOne({ email });
    if (storedOTP) {
      return storedOTP.otp === otp;
    } else {
      throw new Error("OTP not found for the given email");
    }
  } catch (error) {
    throw new Error("Failed to verify OTP");
  }
};
//////////////////////////////student's api/////////////////////////////////

//create student api
router.post("/students/add", async (req, res) => {
  try {
    const course = req.body.course;
    const course_year = req.body.course_year;

    const lastRollNo = await Students.findOne(
      { course: course, course_year: course_year },
      { rollNo: 1 }
    )
      .sort({ rollNo: -1 })
      .limit(1);

    let newRollNo;
    if (lastRollNo) {
      const lastRollNoSeq = parseInt(lastRollNo.rollNo);

      if (!isNaN(lastRollNoSeq)) {
        // If the sequence number is not NaN, increment it
        newRollNo = lastRollNoSeq + 1;
      } else {
        const maxSequenceNumber = await Students.aggregate([
          { $match: { course: course, course_year: course_year } },
          {
            $group: {
              _id: null,
              maxSequence: { $max: { $toInt: "$rollNo" } },
            },
          },
        ]);

        const maxSequence = maxSequenceNumber.length
          ? maxSequenceNumber[0].maxSequence
          : 0;

        newRollNo = maxSequence + 1;
      }
    } else {
      newRollNo = 1;
    }

    req.body.rollNo = newRollNo;
    const student = new Students(req.body);
    await student.save();
    res.status(201).send("Student added successfully.");
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//get students
router.get("/students/get-students", async (req, res) => {
  try {
    const result = await Students.find().sort({ date: -1 });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//get student by id
router.get("/students/get-student/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Students.findById(_id);
    if (!result) {
      return res.status(404).send("User not found.");
    } else {
      res.status(200).send(result);
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//update student
router.patch("/students/update-student/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Students.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    if (!result) {
      return res.status(404).send("User not found.");
    } else {
      res.status(200).send("Student updated successfully.");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//student activation
router.patch("/students/activation/:id", async (req, res) => {
  const _id = req.params.id;
  const { active } = req.body;

  try {
    const student = await Students.findByIdAndUpdate(
      _id,
      { active: active },
      { new: true }
    );

    if (!student) {
      return res.status(404).send("User not found.");
    }

    res
      .status(200)
      .send(
        active
          ? "Student activated successfully"
          : "Student deactivated successfully"
      );
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//post comment api
router.post("/students/contact/add", async (req, res) => {
  const contact = new Contact(req.body);
  try {
    await contact.save();
    res.status(201).send("Thank you for your valuable feedback.");
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//send reply api
router.post("/students/comment/reply", async (req, res) => {
  const reply = new Reply(req.body);
  try {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const subject = req.body.subject;
    const User_reply = req.body.reply;
    const user_contact = await Contact.findOne({ email });
    const result = await reply.save();
    if (user_contact) {
      const mailOptions = {
        from: "Alim.Mohammad619@outlook.com",
        to: email,
        subject: subject,
        html: generateEmailTemplate(
          ` Dear ${fullName}! Thank you for reaching out to us. We have sent you our response.
            If you have any further questions or need additional assistance, 
            please feel free to contact us`,
          `${User_reply}`
        ),
      };
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(500).send("Failed to send reply.");
        } else {
          res.status(201).send("Reply Send Successfully.");
        }
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//get comments
router.get("/students/contact/get-comments", async (req, res) => {
  try {
    const result = await Contact.find().sort({ date: -1 });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//student queries activation
router.patch("/students/comment/activation/:id", async (req, res) => {
  const _id = req.params.id;
  const { active } = req.body;

  try {
    const contact = await Contact.findByIdAndUpdate(
      _id,
      { active: active },
      { new: true }
    );

    if (!contact) {
      return res.status(404).send("User not found.");
    }

    res
      .status(200)
      .send(
        active
          ? "Comment activated successfully"
          : "Comment deactivated successfully"
      );
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//////////////////////////////user's api/////////////////////////////////

//create register api
router.post("/user/register", async (req, res) => {
  const user = new User(req.body);
  try {
    const password = req.body.password;
    const fullName = req.body.fullName;
    const email = req.body.email;
    const result = await user.save();
    if (password) {
      const mailOptions = {
        from: "Alim.Mohammad619@outlook.com",
        to: email,
        subject: `Hi ${fullName} your account has been registered for StudentsTracker.`,
        html: generateEmailTemplate(
          `Hello ${fullName}! Thanks for joining StudentsTracker, We have sent your credential below:`,
          `Email: ${email}`,
          `Password: ${password}.`
        ),
      };
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(500).send("Failed to send email and password");
        } else {
          res.status(201).send(result);
        }
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//get users
router.get("/user/get-users", async (req, res) => {
  try {
    const result = await User.find({ role: { $ne: "Admin" } }).sort({
      date: -1,
    });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//user activation
router.patch("/user/activation/:id", async (req, res) => {
  const _id = req.params.id;
  const { active } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      _id,
      { active: active },
      { new: true }
    );

    if (!user) {
      return res.status(404).send("User not found.");
    }

    res
      .status(200)
      .send(
        active
          ? "User account activated successfully"
          : "User account deactivated successfully"
      );
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//get user by id
router.get("/user/get-user/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await User.findById(_id);
    if (!result) {
      return res.status(404).send("User not found.");
    } else {
      res.status(200).send(result);
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//update user
router.patch("/user/update-user/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const existingUser = await User.findById(_id);

    // Check if the user exists
    if (!existingUser) {
      return res.status(404).send("User not found.");
    }

    // Check if the password field is being updated
    if (existingUser.password !== req.body.password) {
      const mailOptions = {
        from: "Alim.Mohammad619@outlook.com",
        to: existingUser.email,
        subject: `Password has been updated for StudentsTracker by administrator.`,
        html: generateEmailTemplate(
          `Hello ${existingUser.fullName}! Your StudentsTracker account's password has been updated:`,
          `Your updated password: ${req.body.password}`
        ),
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(500).send("Failed to send email and password.");
        } else {
          existingUser.password = req.body.password;
          existingUser.save();

          res.status(200).send("Profile updated successfully.");
        }
      });
    } else {
      const result = await User.findByIdAndUpdate(_id, req.body, {
        new: true,
      });

      if (!result) {
        return res.status(404).send("User not found.");
      }

      res.status(200).send("Profile updated successfully.");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});
//update profile
router.patch("/user/update-profile/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await User.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    if (!result) {
      return res.status(404).send("User not found.");
    } else {
      res.status(200).send("Profile updated successfully.");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//update user password
router.patch("/user/update-password/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    // Retrieve user from database
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Check if current password matches
    if (currentPassword !== user.password) {
      return res.status(401).send("Current password is incorrect.");
    }

    // Update password in database
    user.password = newPassword;
    await user.save();

    res.status(200).send("Password changed successfully.");
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//create login api
router.post("/user/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (user.active) {
      if (user.password === password) {
        res.status(201).send(user);
      } else {
        res.status(404).send("User not found.");
      }
    } else {
      res
        .status(403)
        .send(
          "Login failed. Your account has been deactivated. Please contact your administrator for assistance."
        );
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//create forgot password api
// router.post("/user/forgot-password", async (req, res) => {
//   try {
//     const email = req.body.email;
//     const user = await User.findOne({ email });
//     const userId = user._id;
//     const Id = userId.toString();
//     if (user) {
//       // Generate and send OTP to user's email
//       const otp = generateOTP();
//       const mailOptions = {
//         from: "Alim.Mohammad619@outlook.com",
//         to: email,
//         subject: "Password Reset OTP",
//         html: generateEmailTemplate(
//           `Hello ${email}! Your StudentsTracker account's One-Time Password (OTP) for password reset is provided below:`,
//           `OTP: ${otp} Please use this OTP to complete your password reset process.
//            If you did not request this reset or have any concerns,
//             please contact our support team immediately.`
//         ),
//       };

//       // Send the email
//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           res.status(500).send("Failed to send OTP");
//         } else {
//           // Insert OTP into the database
//           insertOTP(email, otp);
//           res.status(201).send(Id);
//         }
//       });
//     } else {
//       res.status(404).send("User not found");
//     }
//   } catch (err) {
//     res.status(500).send("Internal server error");
//   }
// });

router.post("/user/forgot-password", async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (user) {
      const otp = generateOTP();
       const mailOptions = {
         from: "Alim.Mohammad619@outlook.com",
         to: email,
         subject: "Password Reset OTP",
         html: generateEmailTemplate(
           `Hello ${email}! Your StudentsTracker account's One-Time Password (OTP) for password reset is provided below:`,
           `OTP: ${otp} Please use this OTP to complete your password reset process.
           If you did not request this reset or have any concerns,
            please contact our support team immediately.`
         ),
       };

      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.error("Failed to send OTP:", error);
          res.status(500).send("Failed to send OTP");
        } else {
          const otpInserted = await insertOTP(email, otp);
          if (otpInserted) {
            res.status(201).send("OTP sent and saved successfully");
          } else {
            res.status(500).send("Failed to save OTP");
          }
        }
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.error("Internal server error:", err);
    res.status(500).send("Internal server error");
  }
});
//create reset password api
router.patch("/user/reset-password/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (user) {
      const otp = req.body.otp;
      const newPassword = req.body.new_password;

      // Verify the received OTP
      const isOTPValid = await verifyOTP(user.email, otp);

      if (isOTPValid) {
        // Update the user's password in the database
        await User.updateOne({ _id: userId }, { password: newPassword });

        res.status(200).send("Password reset successfully");
      } else {
        res.status(400).send("Invalid OTP");
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

const getTotalYears = async () => {
  try {
    const courses = await Course.find();
    let totalYears = 0;
    courses.forEach((course) => {
      totalYears += course.years.length;
    });
    return totalYears;
  } catch (err) {
    throw new Error("Error retrieving total years.");
  }
};

//get length of students,teachers,courses
router.get("/resource-quantity", async (req, res) => {
  try {
    const noOfStudents = await Students.countDocuments();
    const noOfTeacher = await User.countDocuments();
    const noOfCourses = await Course.countDocuments();
    const noOfBatches = await getTotalYears();
    res.status(200).send({
      noOfStudents,
      noOfTeacher,
      noOfCourses,
      noOfBatches,
    });
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

router.get("/get-recent-entry", async (req, res) => {
  try {
    const recentTeachers = await User.find({ role: { $ne: "Admin" } })
      .sort({ _id: -1 })
      .limit(5);
    const recentStudents = await Students.find().sort({ _id: -1 }).limit(5);
    const recentMessages = await Contact.find().sort({ _id: -1 }).limit(5);
    res.status(200).send({
      recentTeachers,
      recentStudents,
      recentMessages,
    });
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

router.get("/get-birthday", async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const studentsBirthday = await Students.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dob" }, month] },
          { $eq: [{ $dayOfMonth: "$dob" }, day] },
        ],
      },
    });

    const teachersBirthday = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dob" }, month] },
          { $eq: [{ $dayOfMonth: "$dob" }, day] },
        ],
      },
    });

    res.status(200).send({
      studentsBirthday,
      teachersBirthday,
    });
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});
//////////////////////attendance/////////////////////
//create attendance api
router.post("/students/add-attendance", async (req, res) => {
  const attendance = new Attendance(req.body);
  try {
    const result = await attendance.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json("Internal server error");
  }
});
//get attendance api
router.get("/students/get-attendance", async (req, res) => {
  try {
    const attendanceData = await Attendance.find().sort({ date: -1 });
    const teacherData = await User.find();

    const updatedAttendanceData = attendanceData.map((attendance) => {
      const teacher = teacherData.find(
        (teacher) =>
          teacher._id.toString() === attendance.takenByTeacher_id.toString()
      );

      if (teacher) {
        // If a matching teacher is found, add teacher information to the attendanceData item
        attendance.teacherName = teacher.fullName;
        attendance.teacherProfile = teacher.profileImage;
      }

      return {
        ...attendance._doc, // Spread the original attendance data
        teacherName: attendance.teacherName,
        teacherProfile: attendance.teacherProfile,
      };
    });
    res.status(200).send(updatedAttendanceData);
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//get attendance by id
router.get("/students/get-attendance/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    // Fetch attendance data by ID
    const attendanceData = await Attendance.findById(_id);

    // If attendance data is not found, return 404
    if (!attendanceData) {
      return res.status(404).send("Attendance not found.");
    }

    // Fetch student data for all students
    const studentData = await Students.find();
    const teacherData = await User.find();

    const takenBy = teacherData.find(
      (teacher) =>
        teacher._id.toString() === attendanceData.takenByTeacher_id.toString()
    );
    const { fullName, profileImage } = takenBy;

    // Calculate the number of present students based on the current attendance
    const presentStudents = attendanceData.attendance.filter(
      (record) => record.attendance
    ).length;

    // Calculate the number of absent students based on the current attendance
    const absentStudents = attendanceData.attendance.length - presentStudents;

    // Calculate the attendance percentage
    const totalStudents = attendanceData.attendance.length;
    const attendancePercentage = (
      (presentStudents / totalStudents) *
      100
    ).toFixed(2);

    // Create an array to store the final result
    const studentDetails = {
      _id: attendanceData._id,
      attendance: attendanceData.attendance.map((attendanceRecord) => {
        // Find the corresponding student details using the _id field
        const student = studentData.find(
          (student) =>
            student._id.toString() === attendanceRecord._id.toString()
        );

        // Check if the student is found and create a new object with the required fields
        if (student) {
          const { rollNo, profileImage, fullName, gender } = student;
          // Return the object with the required fields
          return {
            _id: attendanceRecord._id,
            attendance: attendanceRecord.attendance,
            rollNo,
            profileImage,
            fullName,
            gender,
          };
        }
      }),
      takenByTeacher: fullName,
      profileImage: profileImage,
      course: attendanceData.course,
      courseYear: attendanceData.courseYear,
      date: attendanceData.date,
      active: attendanceData.active,
      numberOfStudents: totalStudents,
      numberOfPresentStudents: presentStudents,
      numberOfAbsentStudents: absentStudents,
      attendancePercentage,
    };

    // Send the studentDetails object as the response
    res.status(200).send(studentDetails);
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

// Function to check if a given date is a Sunday
function isSunday(date) {
  return date.getDay() === 0; // 0 represents Sunday in JavaScript's Date.getDay() method
}

// GET overall attendance of specific student within a date range
router.get("/student/get-student-attendance/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const { startDate, endDate } = req.query; // Add startDate and endDate

    // Fetch student data for the specific student
    const studentData = await Students.findById(studentId);
    if (!studentData) {
      return res.status(404).send("Student not found.");
    }

    // Fetch all attendance records within the date range
    const attendanceData = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    });

    // Prepare the overallAttendance array in the desired format
    const overallAttendance = attendanceData.map((record) => {
      const studentAttendance = record.attendance.find(
        (a) => a._id.toString() === studentId
      );
      return {
        _id: record._id, // Assuming "record._id" is a unique identifier provided by MongoDB
        date: record.date,
        attendance: studentAttendance ? studentAttendance.attendance : false,
      };
    });

    const attendanceCounterArray = attendanceData.map((record) => {
      const studentAttendance = record.attendance.find(
        (a) => a._id.toString() === studentId
      );
      return studentAttendance
        ? studentAttendance.attendance === true
          ? 1
          : 0
        : 0;
    });

    // Calculate the number of present days
    const presentDays = overallAttendance.filter(
      (record) => record.attendance
    ).length;

    // Calculate the number of days in the date range excluding Sundays
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalDaysExcludingSundays = 0;

    for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
      if (!isSunday(day)) {
        totalDaysExcludingSundays++;
      }
    }

    // Calculate the attendance percentage
    const attendancePercentage = (
      (presentDays / overallAttendance.length) *
      100
    ).toFixed(2);

    // Prepare the response object
    const response = {
      fullName: studentData.fullName,
      profileImage: studentData.profileImage,
      rollNo: studentData.rollNo,
      student_id: studentData._id,
      overallAttendance,
      course: studentData.course,
      courseYear: studentData.courseYear,
      startDate,
      endDate,
      attendancePercentage: `${attendancePercentage}%`,
      totalAttendanceDays: overallAttendance.length,
      attendanceCounterArray: attendanceCounterArray,
      presentDays,
      absentDays: overallAttendance.length - presentDays,
    };

    // Send the response object as the response
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//attendance activation
router.patch("/students/attendance/activation/:id", async (req, res) => {
  const _id = req.params.id;
  const { active } = req.body;

  try {
    const attendance = await Attendance.findByIdAndUpdate(
      _id,
      { active: active },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).send("Attendance not found.");
    }

    res
      .status(200)
      .send(
        active
          ? "Attendance activated successfully"
          : "Attendance deactivated successfully"
      );
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//update attendance
router.patch("/students/update-attendance/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const { attendanceId, attendanceValue } = req.body;

    // Find the attendance object in the array that matches the attendanceId
    const attendanceDoc = await Attendance.findById(_id);
    if (!attendanceDoc) {
      return res.status(404).send("User not found.");
    }

    const attendanceIndex = attendanceDoc.attendance.findIndex(
      (attendance) => attendance._id === attendanceId
    );
    if (attendanceIndex === -1) {
      return res.status(404).send("Attendance not found.");
    }

    // Update the attendance value in the document
    attendanceDoc.attendance[attendanceIndex].attendance = attendanceValue;

    // Save the updated document using findByIdAndUpdate()
    const updatedDoc = await Attendance.findByIdAndUpdate(
      _id,
      { attendance: attendanceDoc.attendance },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).send("User not found.");
    } else {
      res.status(200).send("Attendance updated successfully.");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//delete attendance
router.delete("/students/delete-attendance/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Attendance.findByIdAndDelete(_id);
    if (!result) {
      return res.status(404).send("User not found.");
    } else {
      res.status(200).send("Deleted Successfully.");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//////////////////////////////course's api/////////////////////////////////
//add courses api
router.post("/students/courses/add", async (req, res) => {
  const course = new Course(req.body);
  try {
    await course.save();
    res.status(201).send("Course added successfully");
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//get student's courses
router.get("/students/courses", async (req, res) => {
  try {
    const result = await Course.find().sort({ date: -1 });
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//course activation
router.patch("/students/courses/activation/:id", async (req, res) => {
  const _id = req.params.id;
  const { active } = req.body;

  try {
    const course = await Course.findByIdAndUpdate(
      _id,
      { active: active },
      { new: true }
    );

    if (!course) {
      return res.status(404).send("Course not found.");
    }

    res
      .status(200)
      .send(
        active
          ? "Course activated successfully"
          : "Course deactivated successfully"
      );
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

//update course
router.patch("/students/update-course/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Course.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
    if (!result) {
      return res.status(404).send("Course not found.");
    } else {
      res.status(200).send("Course updated successfully.");
    }
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;
