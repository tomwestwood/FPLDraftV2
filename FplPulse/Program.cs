using FPLV2Core.Alerts;
using FPLV2Core.Jobs;
using FPLV2Core.Logger;
using System;

namespace FplPulse
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Firing up the KenBot v1.0...");
            Run();
        }

        static void Run()
        {
            var cmd = new FPLUpdatesJob(new ConsoleLogger(), new SlackAlert());
            //var cmd = new FPLReportsJob();
            cmd.Run();
        }
    }
}
