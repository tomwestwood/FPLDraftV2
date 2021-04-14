using System;
using System.Collections.Generic;
using System.Text;

namespace FPLV2Core.Alerts.Interfaces
{
    public interface IAlert
    {
        public void MessageAlert(string botMessage, ILogger logger);

        public void ImageMessageAlert(string botMessage, string botImage, ILogger logger);
    }
}
