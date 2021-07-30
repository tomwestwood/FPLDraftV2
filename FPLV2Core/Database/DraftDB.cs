using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Runtime.Serialization.Formatters.Binary;
using FPLV2Core.Models.FPLDraft;
using Newtonsoft.Json;

namespace FPLV2Core.Database.DraftDB
{
    public static class DraftDB
    {
        private static string db_connection_string = "Data Source=fplplus.database.windows.net;Initial Catalog=FPLPlus;User id=tomwestwood;Password=Smithy123;";
        private static SqlConnection connection => new SqlConnection(db_connection_string);

        public static Draft GetDraft()
        {
            return GetDraft(13);
        }

        public static Draft GetDraft(int draft_id)
        {
            var sp = "sel_draft";
            var dt = new DataTable();
            var draft = new Draft();
            using(var sqlCmd = new SqlCommand(sp, connection))
            {
                sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
                sqlCmd.Parameters.AddWithValue("@draft_id", draft_id);
                connection.Open();
                using(var sqlAdapter = new SqlDataAdapter(sqlCmd))
                {
                    sqlAdapter.Fill(dt);

                    if (dt.Rows.Count == 0)
                        throw new Exception("Can't get that Draft...");

                    try
                    {
                        var draftRow = dt.Rows[0];
                        draft = new Draft()
                        {
                            id = (int)draftRow["id"],
                            draft_name = (string)draftRow["draft_name"],
                            status_id = (DraftStatus)((int)draftRow["status_id"]),
                            direction = (bool)draftRow["direction"],
                            passcode = (string)draftRow["passcode"],
                            draft_manager_id = (int)draftRow["draft_manager_id"],
                            draft_round = (int)draftRow["draft_round"]
                        };
                    }
                    catch(Exception ex)
                    {
                        throw new Exception("Can't get that Draft...");
                    }
                }
            }

            return draft;
        }

        public static List<DraftManager> GetDraftManagers(int draftId)
        {
            var sp = "sel_draftManagers";
            var dt = new DataTable();
            var draftManagers = new List<DraftManager>();
            using (var sqlCmd = new SqlCommand(sp, connection))
            {
                sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
                sqlCmd.Parameters.AddWithValue("@draft_id", draftId);
                connection.Open();
                using (var sqlAdapter = new SqlDataAdapter(sqlCmd))
                {
                    sqlAdapter.Fill(dt);

                    if (dt.Rows.Count == 0)
                        throw new Exception("Can't get that Draft...");

                    try
                    {
                        foreach(DataRow dr in dt.Rows)
                        {
                            draftManagers.Add(new DraftManager()
                            {
                                id = (int)dr["id"],
                                draft_id = (int)dr["draft_id"],
                                name = (string)dr["name"],
                                team_name = (string)dr["team_name"],
                                draft_seed = (int)dr["draft_seed"],
                                team_nickname = !dr.IsNull("team_nickname") ? (string)dr["team_nickname"] : string.Empty,
                                team_image_url = !dr.IsNull("team_image_url") ? (string)dr["team_image_url"] : string.Empty,
                                manager_image_url = !dr.IsNull("manager_image_url") ? (string)dr["manager_image_url"] : string.Empty,
                                team_colour_1 = !dr.IsNull("team_colour_1") ? (string)dr["team_colour_1"] : string.Empty,
                                team_colour_2 = !dr.IsNull("team_colour_2") ? (string)dr["team_colour_2"] : string.Empty,
                                team_fpl_id = !dr.IsNull("team_fpl_id") ? (int)dr["team_fpl_id"] : 0,
                                waiver_order = !dr.IsNull("waiver_order") ? (int)dr["waiver_order"] : 0,
                                transfers_remaining = !dr.IsNull("transfers_remaining") ? (int)dr["transfers_remaining"] : 0,
                                slack_id = !dr.IsNull("slack_id") ? (string)dr["slack_id"] : string.Empty
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        throw new Exception("Can't get that Draft...");
                    }
                }
            }

            return draftManagers;
        }

        public static List<DraftManagerPick> GetDraftManagerPicks(int draftId)
        {
            var sp = "sel_draftManagerPicks";
            var dt = new DataTable();
            var draftManagerPicks = new List<DraftManagerPick>();
            using (var sqlCmd = new SqlCommand(sp, connection))
            {
                sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
                sqlCmd.Parameters.AddWithValue("@draft_id", draftId);
                connection.Open();
                using (var sqlAdapter = new SqlDataAdapter(sqlCmd))
                {
                    sqlAdapter.Fill(dt);

                    try
                    {
                        foreach (DataRow dr in dt.Rows)
                        {
                            draftManagerPicks.Add(new DraftManagerPick()
                            {
                                id = (int)dr["id"],
                                draft_manager_id = (int)dr["draft_manager_id"],
                                nominator_id = (int)dr["nominator_id"],
                                player_id = (int)dr["player_id"],
                                player_name = (string)dr["player_name"],
                                pick_order = (int)dr["pick_order"],
                                draft_id = (int)dr["draft_id"],
                                value_price = (decimal)dr["value_price"],
                                signed_price = (decimal)dr["signed_price"],
                                sealed_bids = JsonConvert.DeserializeObject<IEnumerable<SealedBid>>(dr["sealed_bids"].ToString())
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        throw new Exception("Can't get that Draft...");
                    }
                }
            }

            return draftManagerPicks;
        }

        public static List<DraftManagerFavourite> GetDraftManagerFavourites(int draftManagerId)
        {
            var sp = "sel_draftManagerFavourites";
            var dt = new DataTable();
            var draftManagerFavourites = new List<DraftManagerFavourite>();
            using (var sqlCmd = new SqlCommand(sp, connection))
            {
                sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
                sqlCmd.Parameters.AddWithValue("@draft_manager_id", draftManagerId);
                connection.Open();

                using (var sqlAdapter = new SqlDataAdapter(sqlCmd))
                {
                    sqlAdapter.Fill(dt);

                    try
                    {
                        foreach (DataRow dr in dt.Rows)
                        {
                            draftManagerFavourites.Add(new DraftManagerFavourite()
                            {
                                id = (int)dr["id"],
                                draft_manager_id = (int)dr["draft_manager_id"],
                                player_id = (int)dr["player_id"]
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        throw new Exception("Can't get that Draft...");
                    }
                }
            }

            return draftManagerFavourites;
        }

        public static DraftManagerPick SavePick(DraftManagerPick pick)
        {
            var sp = "dbo.save_DraftManagerPick";

            using (SqlConnection conn = new SqlConnection(db_connection_string))
            {
                using (var cmd = new SqlCommand(sp, conn))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@nominator_id", pick.nominator_id);
                    cmd.Parameters.AddWithValue("@draft_manager_id", pick.draft_manager_id);
                    cmd.Parameters.AddWithValue("@player_id", pick.player_id);
                    cmd.Parameters.AddWithValue("@pick_order", pick.pick_order);
                    cmd.Parameters.AddWithValue("@player_name", pick.player_name ?? pick.player?.web_name ??  "");
                    cmd.Parameters.AddWithValue("@current_points", pick.current_points);
                    cmd.Parameters.AddWithValue("@draft_id", pick.draft_id);
                    cmd.Parameters.AddWithValue("@value_price", pick.value_price);
                    cmd.Parameters.AddWithValue("@signed_price", pick.signed_price);
                    cmd.Parameters.AddWithValue("@sealed_bids", JsonConvert.SerializeObject(pick.sealed_bids));

                    conn.Open();
                    pick.id = Convert.ToInt32(cmd.ExecuteScalar());

                    return pick;
                }
            }
        }

        public static DraftManagerPick UpdatePick(DraftManagerPick pick)
        {
            var sp = "dbo.update_DraftManagerPick";

            using (SqlConnection conn = new SqlConnection(db_connection_string))
            {
                using (var cmd = new SqlCommand(sp, conn))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@id", pick.id);
                    cmd.Parameters.AddWithValue("@nominator_id", pick.nominator_id);
                    cmd.Parameters.AddWithValue("@draft_manager_id", pick.draft_manager_id);
                    cmd.Parameters.AddWithValue("@player_id", pick.player_id);
                    cmd.Parameters.AddWithValue("@pick_order", pick.pick_order);
                    cmd.Parameters.AddWithValue("@player_name", pick.player_name ?? pick.player?.web_name ?? "");
                    cmd.Parameters.AddWithValue("@current_points", pick.current_points);
                    cmd.Parameters.AddWithValue("@draft_id", pick.draft_id);
                    cmd.Parameters.AddWithValue("@value_price", pick.value_price);
                    cmd.Parameters.AddWithValue("@signed_price", pick.signed_price);
                    cmd.Parameters.AddWithValue("@sealed_bids", JsonConvert.SerializeObject(pick.sealed_bids));

                    conn.Open();
                    cmd.ExecuteNonQuery();

                    return pick;
                }
            }
        }

        public static void UpdateDraft(Draft draft)
        {
            var sp = "dbo.update_Draft";

            using (SqlConnection conn = new SqlConnection(db_connection_string))
            {
                using (var cmd = new SqlCommand(sp, conn))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@draft_id", draft.id);
                    cmd.Parameters.AddWithValue("@draft_manager_id", draft.draft_manager_id);
                    cmd.Parameters.AddWithValue("@status_id", draft.status_id);
                    cmd.Parameters.AddWithValue("@direction", draft.direction);
                    cmd.Parameters.AddWithValue("@draft_round", draft.draft_round);

                    //try
                    //{
                    conn.Open();
                    cmd.ExecuteNonQuery();
                    //}
                    //catch(Exception ex)
                    //{
                    //    throw new Exception($"Cannot save pick -> {ex.Message.ToString()}");
                    //}
                }
            }
        }

        public static void SetFavourite(DraftManagerFavourite favourite)
        {
            var sp = "dbo.save_Favourite";

            using (SqlConnection conn = new SqlConnection(db_connection_string))
            {
                using (var cmd = new SqlCommand(sp, conn))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@draft_manager_id", favourite.draft_manager_id);
                    cmd.Parameters.AddWithValue("@player_id", favourite.player_id);

                    //try
                    //{
                    conn.Open();
                    cmd.ExecuteNonQuery();
                    //}
                    //catch(Exception ex)
                    //{
                    //    throw new Exception($"Cannot save pick -> {ex.Message.ToString()}");
                    //}
                }
            }
        }

        public static void UnsetFavourite(DraftManagerFavourite favourite)
        {
            var sp = "dbo.delete_Favourite";

            using (SqlConnection conn = new SqlConnection(db_connection_string))
            {
                using (var cmd = new SqlCommand(sp, conn))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@draft_manager_id", favourite.draft_manager_id);
                    cmd.Parameters.AddWithValue("@player_id", favourite.player_id);

                    //try
                    //{
                    conn.Open();
                    cmd.ExecuteNonQuery();
                    //}
                    //catch(Exception ex)
                    //{
                    //    throw new Exception($"Cannot save pick -> {ex.Message.ToString()}");
                    //}
                }
            }
        }


        public static Nomination GetCurrentNomination()
        {
            var sp = "sel_nomination";
            var dt = new DataTable();
            var nomination = new Nomination();
            using (var sqlCmd = new SqlCommand(sp, connection))
            {
                sqlCmd.CommandType = System.Data.CommandType.StoredProcedure;
                connection.Open();
                using (var sqlAdapter = new SqlDataAdapter(sqlCmd))
                {
                    sqlAdapter.Fill(dt);

                    if (dt.Rows.Count == 0)
                        throw new Exception("No current nomination...");

                    try
                    {
                        var nominationRow = dt.Rows[0];
                        nomination = new Nomination()
                        {
                            id = (int)nominationRow["id"],
                            date_active = (DateTime)nominationRow["date_active"],
                            date_nominated = (DateTime?)nominationRow["date_nominated"],
                            player_id = (int)nominationRow["player_id"],
                            nominator_id = (int)nominationRow["nominator_id"],
                            manager_id = (int)nominationRow["manager_id"],
                            deadline_date = (DateTime?)nominationRow["deadline_date"],
                            completion_date = (DateTime?)nominationRow["completion_date"]
                        };
                    }
                    catch (Exception ex)
                    {
                        throw new Exception("Can't get that nomination...");
                    }
                }
            }

            return nomination;
        }

        public static void CreateNominationLink()
        {
            var sp = "dbo.create_nomination";

            using (SqlConnection conn = new SqlConnection(db_connection_string))
            {
                using (var cmd = new SqlCommand(sp, conn))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }
        }

        public static void NominatePlayer(int nomination_id, DraftManager draft_manager, int player_id)
        {
            var sp = "dbo.save_nomination";

            using (SqlConnection conn = new SqlConnection(db_connection_string))
            {
                using (var cmd = new SqlCommand(sp, conn))
                {
                    cmd.Parameters.AddWithValue("@nomination_id", nomination_id);
                    cmd.Parameters.AddWithValue("@draft_manager_id", draft_manager.id);
                    cmd.Parameters.AddWithValue("@draft_manager_order", draft_manager.waiver_order);
                    cmd.Parameters.AddWithValue("@player_id", player_id);

                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }
        }

        public static void UpdateDraftManagerWaiverInfo(DraftManager dm)
        {
            var sp = "dbo.UpdateDraftManager_WaiverInfo";

            using (SqlConnection conn = new SqlConnection(db_connection_string))
            {
                using (var cmd = new SqlCommand(sp, conn))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@id", dm.id);
                    cmd.Parameters.AddWithValue("@waiver_order", dm.waiver_order);
                    cmd.Parameters.AddWithValue("@transfers_remaining", dm.transfers_remaining);

                    //try
                    //{
                    conn.Open();
                    cmd.ExecuteNonQuery();
                    //}
                    //catch(Exception ex)
                    //{
                    //    throw new Exception($"Cannot save pick -> {ex.Message.ToString()}");
                    //}
                }
            }
        }
    }
}
