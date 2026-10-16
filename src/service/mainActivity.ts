import { JWT } from "@/model/jwt";
import { MainActivity } from "@/model/mainActivity";
import { Result } from "@/model/result";
import ActivitySchema from "@/schema/activity";
import MainActivitySchema from "@/schema/mainActivity";
import { isValidObjectId } from "mongoose";
import { Team } from "@/model/user";

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID");
const validTeams: Team[] = ["SOSIAL", "PRODUKSI", "DISTRIBUSI", "NERWILIS", "IPDS", "TU"];
const canManage = (claims: JWT) => Boolean(claims.team);
const teamList = (teams: Team[] | Team | null | undefined): Team[] =>
  Array.isArray(teams) ? teams : teams ? [teams] : [];
const validTeamList = (teams: unknown): teams is Team[] =>
  Array.isArray(teams) && teams.length > 0 && teams.every((team) => validTeams.includes(team));
const canAccess = (record: { team?: Team[] | Team }, claims: JWT) =>
  Boolean(claims.team) && (claims.team === "TU" || teamList(record.team).includes(claims.team as Team));

export const getMainActivities = async (
  claims: JWT,
  year?: string,
  activeOnly = false,
  teamFilter?: string,
): Promise<Result<any[]>> => {
  const query: Record<string, any> = {};
  if (year) query.year = Number(year);
  if (activeOnly) query.isActive = true;
  if (claims.team !== "TU") {
    if (!claims.team) return { data: [], message: "User tidak memiliki tim", code: 200 };
    if (teamFilter && teamFilter !== claims.team) return { data: [], message: "Tidak ada Kegiatan Utama untuk tim tersebut", code: 200 };
    query.team = claims.team;
  } else if (teamFilter && validTeams.includes(teamFilter as Team)) {
    query.team = teamFilter;
  }
  const records = await MainActivitySchema.find(query).sort({ year: -1, name: 1 });
  const data = await Promise.all(records.map(async (record) => ({
    ...record.toObject(),
    team: teamList(record.team),
    activityCount: await ActivitySchema.countDocuments({ mainActivityId: record._id }),
  })));
  return { data, message: "Successfully retrieved main activities", code: 200 };
};

export const getMainActivity = async (id: string, claims: JWT): Promise<Result<any>> => {
  if (!isValidObjectId(id)) return { data: null, message: "Invalid main activity ID", code: 400 };
  const data = await MainActivitySchema.findById(id);
  if (data && !canAccess(data, claims)) return { data: null, message: "Main activity not found", code: 404 };
  return { data, message: data ? "Successfully retrieved main activity" : "Main activity not found", code: data ? 200 : 404 };
};

export const storeMainActivity = async (
  payload: MainActivity,
  claims: JWT,
): Promise<Result<any>> => {
  if (!canManage(claims)) return { data: null, message: "User tidak memiliki tim untuk mengelola Kegiatan Utama", code: 403 };
  const name = typeof payload.name === "string" ? payload.name.trim().replace(/\s+/g, " ") : "";
  const year = Number(payload.year);
  const team = payload.team ?? [claims.team as Team];
  if (!name || !Number.isInteger(year) || year < 2000 || year > 2100 || !validTeamList(team)) {
    return { data: null, message: "Nama dan tahun Kegiatan Utama wajib valid", code: 400 };
  }
  if (claims.team !== "TU" && !teamList(team).includes(claims.team as Team)) {
    return { data: null, message: "Tim Anda harus tetap dipilih pada Kegiatan Utama", code: 403 };
  }
  try {
    const data = await MainActivitySchema.create({ name, normalizedName: normalizeName(name), year, isActive: true, team: [...new Set(team)] });
    return { data, message: "Kegiatan Utama berhasil dibuat", code: 201 };
  } catch (error: any) {
    if (error?.code === 11000) return { data: null, message: "Nama Kegiatan Utama sudah digunakan pada tim dan tahun tersebut", code: 409 };
    throw error;
  }
};

export const updateMainActivity = async (
  id: string,
  payload: Partial<MainActivity>,
  claims: JWT,
): Promise<Result<any>> => {
  if (!canManage(claims)) return { data: null, message: "User tidak memiliki tim untuk mengelola Kegiatan Utama", code: 403 };
  if (!isValidObjectId(id)) return { data: null, message: "Invalid main activity ID", code: 400 };
  const existing = await MainActivitySchema.findById(id);
  if (!existing) return { data: null, message: "Main activity not found", code: 404 };
  if (!canAccess(existing, claims) || (claims.team !== "TU" && !teamList(existing.team).length)) return { data: null, message: "Main activity not found", code: 404 };
  const name = typeof payload.name === "string" ? payload.name.trim().replace(/\s+/g, " ") : existing.name;
  const year = payload.year === undefined ? existing.year : Number(payload.year);
  const isActive = payload.isActive === undefined ? existing.isActive : Boolean(payload.isActive);
  const existingTeams = teamList(existing.team);
  const team = payload.team ?? existingTeams;
  if (!name || !Number.isInteger(year) || year < 2000 || year > 2100 || !validTeamList(team)) {
    return { data: null, message: "Nama dan tahun Kegiatan Utama wajib valid", code: 400 };
  }
  if (claims.team !== "TU" && !teamList(team).includes(claims.team as Team)) {
    return { data: null, message: "Tim Anda harus tetap dipilih pada Kegiatan Utama", code: 403 };
  }
  if (year !== existing.year) {
    const referenced = await ActivitySchema.exists({ mainActivityId: id });
    if (referenced) return { data: null, message: "Tahun tidak dapat diubah karena Kegiatan Utama sudah digunakan", code: 409 };
  }
  if (payload.team !== undefined) {
    const linkedActivities = await ActivitySchema.find({ mainActivityId: id }).select("team").lean();
    if (linkedActivities.some((activity) => !teamList(team).includes(activity.team))) {
      return { data: null, message: "Semua tim Kegiatan yang terhubung harus tetap tercakup dalam Kegiatan Utama", code: 409 };
    }
  }
  try {
    const update: Record<string, unknown> = { name, normalizedName: normalizeName(name), year, isActive };
    update.team = [...new Set(team)];
    const data = await MainActivitySchema.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true },
    );
    return { data, message: "Kegiatan Utama berhasil diperbarui", code: 200 };
  } catch (error: any) {
    if (error?.code === 11000) return { data: null, message: "Nama Kegiatan Utama sudah digunakan pada tim dan tahun tersebut", code: 409 };
    throw error;
  }
};

export const deleteMainActivity = async (id: string, claims: JWT): Promise<Result<null>> => {
  if (!canManage(claims)) return { data: null, message: "User tidak memiliki tim untuk mengelola Kegiatan Utama", code: 403 };
  if (!isValidObjectId(id)) return { data: null, message: "Invalid main activity ID", code: 400 };
  const existing = await MainActivitySchema.findById(id);
  if (!existing || !canAccess(existing, claims) || (claims.team !== "TU" && !teamList(existing.team).length)) {
    return { data: null, message: "Main activity not found", code: 404 };
  }
  const referenced = await ActivitySchema.exists({ mainActivityId: id });
  if (referenced) return { data: null, message: "Kegiatan Utama sudah digunakan; nonaktifkan jika tidak dipakai lagi", code: 409 };
  const deleted = await MainActivitySchema.findByIdAndDelete(id);
  return { data: null, message: deleted ? "Kegiatan Utama berhasil dihapus" : "Main activity not found", code: deleted ? 200 : 404 };
};