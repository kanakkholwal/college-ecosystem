"use server";
import { revalidatePath } from "next/cache";
import { getSession } from "src/lib/auth";
import dbConnect from "src/lib/dbConnect";
import UserModel, { UserWithId } from "src/models/user";

export async function updateUser(userId: string, data: Partial<UserWithId>) {
  "use server";
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    await dbConnect();
    const adminUser = await UserModel.findById(session.user._id);
    if (!adminUser) {
      return {
        success: false,
        message: "User not found",
      };
    }
    // must be admin
    if (!adminUser.roles.includes("admin")) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }
    // cannot remove admin role from the only admin
    if (data?.roles && data?.roles?.includes("admin")) {
      const user = await UserModel.findById(userId);
      if (user.roles.includes("admin")) {
        const adminCount = await UserModel.countDocuments({
          roles: "admin",
        });
        if (adminCount === 1) {
          return {
            success: false,
            message: "Cannot remove admin role from the only admin",
          };
        }
      }
    }
    await UserModel.findByIdAndUpdate(userId, { ...data });

    revalidatePath("/admin/users", "page");
    revalidatePath(`/admin/users/${userId}/update`, "page");

    return {
      success: true,
      message: "Roles updated",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "An error occurred",
    };
  }
}
export async function getUser(userId: string): Promise<UserWithId | null> {
  try {
    await dbConnect();
    const user = await UserModel.findById(userId);
    if (!user) {
      return null;
    }
    return Promise.resolve(JSON.parse(JSON.stringify(user)));
  } catch (error) {
    console.log(error);
    return Promise.resolve(null);
  }
}

export async function getUsers(
  query: string,
  skip: number,
  filter: {
    [key: string]: any;
  }
): Promise<{ users: UserWithId[]; hasMore: boolean }> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        users: [],
        hasMore: false,
      };
    }

    const resultsPerPage = 50;
    const filterQuery = {
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { rollNo: { $regex: query, $options: "i" } },
      ],
    } as unknown as any;
    if (filter["department"]) filterQuery["department"] = filter["department"];
    if (filter["roles"]) filterQuery["roles"] = filter["roles"];

    await dbConnect();
    const users = await UserModel.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(resultsPerPage)
      .select("firstName lastName email rollNo roles createdAt department")
      .exec();
    const hasMore = users.length === resultsPerPage;

    return Promise.resolve({
      users: JSON.parse(JSON.stringify(users)),
      hasMore,
    });
  } catch (error) {
    console.log(error);
    return Promise.reject(`An error occurred`);
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    await dbConnect();
    const adminUser = await UserModel.findById(session.user._id);
    if (!adminUser) {
      return {
        success: false,
        message: "User not found",
      };
    }
    // must be admin
    if (adminUser.roles.includes("admin")) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }
    //  cannot delete user if it is the only admin
    if (adminUser.includes("admin")) {
      const user = await UserModel.findById(userId);
      if (user.includes("admin")) {
        const adminCount = await UserModel.countDocuments({
          roles: "admin",
        });
        if (adminCount === 1) {
          return {
            success: false,
            message: "Cannot delete the only admin",
          };
        }
      }
    }
    await UserModel.findById(userId).deleteOne();

    revalidatePath("/admin/users", "page");

    return {
      success: true,
      message: "User deleted",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "An error occurred",
    };
  }
}
