import initializeFirestore from "@/config/firebase";
import { Activity } from "@/model/activity";
import { ActivityRepository } from "@/repository/activity";
import { Query } from "firebase-admin/firestore";

const db = initializeFirestore();
const activitiesRef = db.collection("activities");

export const firebaseActivityRepository = (): ActivityRepository => {
  const create = async (activity: Activity): Promise<Activity> => {
    var docRef = activitiesRef.doc();

    const data = {
      ...activity,
      _id: docRef.id,
    };

    await docRef.set(data);

    return data;
  };

  const findById = async (id: string): Promise<Activity | null> => {
    return new Promise((resolve, reject) => {
      const unsubscribe = activitiesRef.doc(id).onSnapshot(
        (docSnapshot) => {
          const activity: Activity = docSnapshot.data() as Activity;
          resolve(activity);
          unsubscribe();
        },
        (err) => {
          console.error(`Encountered error: ${err}`);
          reject(err);
        }
      );
    });
  };

  const findManyById = async (ids: string[]): Promise<Activity[]> => {
    return new Promise((resolve, reject) => {
      const unsubscribe = activitiesRef.where("_id", "in", ids).onSnapshot(
        (docSnapshot) => {
          const activities: Activity[] = docSnapshot.docs.map(
            (doc) => doc.data() as Activity
          );
          resolve(activities);
          unsubscribe();
        },
        (err) => {
          console.error(`Encountered error: ${err}`);
          reject(err);
        }
      );
    });
  };

  const findAll = async (queries: any = {}): Promise<Activity[]> => {
    return new Promise((resolve, reject) => {
      let query = activitiesRef as Query<Activity>;

      Object.keys(queries).forEach((key) => {
        query = query.where(key, "==", queries[key]);
      });

      const unsubscribe = query.onSnapshot(
        (docSnapshot) => {
          const activities: Activity[] = docSnapshot.docs.map(
            (doc) => doc.data() as Activity
          );
          resolve(activities);
          unsubscribe();
        },
        (err) => {
          console.error(`Encountered error: ${err}`);
          reject(err);
        }
      );
    });
  };

  const update = async (
    id: string,
    activity: Partial<Activity>
  ): Promise<Activity | null> => {
    await activitiesRef.doc(id).update(activity, {
      exists: true,
    });

    return new Promise((resolve, reject) => {
      const unsubscribe = activitiesRef.doc(id).onSnapshot(
        (docSnapshot) => {
          const activity: Activity = docSnapshot.data() as Activity;
          resolve(activity);
          unsubscribe();
        },
        (err) => {
          console.error(`Encountered error: ${err}`);
          reject(err);
        }
      );
    });
  };

  const deleteOne = async (id: string): Promise<void> => {
    await activitiesRef.doc(id).delete();
  };

  const deleteMany = async (ids: string[]): Promise<void> => {
    const activityDocs = await activitiesRef.where("_id", "in", ids).get();

    activityDocs.docs.forEach(async (doc) => {
      await doc.ref.delete();
    });
  };

  return {
    create,
    findById,
    findManyById,
    findAll,
    update,
    delete: deleteOne,
    deleteMany,
  };
};
