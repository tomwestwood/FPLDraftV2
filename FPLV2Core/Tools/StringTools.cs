using System.Globalization;
using System.Text;

namespace FPLV2Core.Tools
{
    public static class StringTools
    {
        public static string RemoveUnsafeCharacters(string text)
        {
            var normalisedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();
            foreach(var c in normalisedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                    stringBuilder.Append(c);
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }
    }
}
