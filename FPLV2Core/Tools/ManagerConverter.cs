using System.Globalization;
using System.Text;

namespace FPLV2Core.Tools
{
    public static class ManagerConverter
    {
        public static string GetManagerShortName(string managerName)
        {
            var shortName = "Unknown";
            switch(managerName)
            {
                case "Anthony Eddowes":
                    shortName = "Ant";
                    break;
                case "Ben Woodall":
                    shortName = "Ben";
                    break;
                case "Chris Eddowes":
                    shortName = "Chris";
                    break;
                case "Chris Thompson":
                    shortName = "Tomo";
                    break;
                case "Dan Hughes":
                    shortName = "Dan";
                    break;
                case "Daniel Picken":
                    shortName = "Picken";
                    break;
                case "Lee Woodall":
                    shortName = "Lee";
                    break;
                case "Philip Nicklin":
                    shortName = "Phil";
                    break;
                case "Phil Prescott":
                    shortName = "LP";
                    break;
                case "Tom Westwood":
                    shortName = "Tom";
                    break;
                case "Tony Nicklin":
                    shortName = "Tun";
                    break;
                case "Wayne Nicklin":
                    shortName = "Wayne";
                    break;
            }


            return shortName;
        }
    }
}
