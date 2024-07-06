import contextlib
from carreralib import ControlUnit
from rms import RMS

def main():
    with contextlib.closing(ControlUnit('D2:B9:57:15:EE:AC')) as cu:
        print("CU version %s" % cu.version())

        rms = RMS(cu)

        while True:
            try:
                rms.run()
            except KeyboardInterrupt:
                print("\nProgram terminated by user.")
                break
            except Exception as e:
                print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
