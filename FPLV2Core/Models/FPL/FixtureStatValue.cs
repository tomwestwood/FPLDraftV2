using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace FPLV2Core.Models.FPL
{
    [Serializable]
    public class FixtureStatValue
    {
        [JsonProperty("element")]
        public int Element { get; set; }

        [JsonProperty("value")]
        public int Value { get; set; }

        public int ValueVariation { get; set; }
    }

    public class FixtureStatValueComparer : IEqualityComparer<FixtureStatValue>
    {
        // Products are equal if their names and product numbers are equal.
        public bool Equals(FixtureStatValue x, FixtureStatValue y)
        {

            //Check whether the compared objects reference the same data.
            if (Object.ReferenceEquals(x, y)) return true;

            //Check whether any of the compared objects is null.
            if (Object.ReferenceEquals(x, null) || Object.ReferenceEquals(y, null))
                return false;

            //Check whether the products' properties are equal.
            return x.Element == y.Element && x.Value == y.Value;
        }

        // If Equals() returns true for a pair of objects 
        // then GetHashCode() must return the same value for these objects.

        public int GetHashCode(FixtureStatValue fixtureStatValue)
        {
            //Check whether the object is null
            if (Object.ReferenceEquals(fixtureStatValue, null)) return 0;

            //Get hash code for the Name field if it is not null.
            int hashElement = fixtureStatValue.Element.GetHashCode();

            //Get hash code for the Code field.
            int hashValue = fixtureStatValue.Value.GetHashCode();

            //Calculate the hash code for the product.
            return hashElement ^ hashValue;
        }
    }
}
