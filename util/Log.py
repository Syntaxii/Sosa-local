
# Extremely basic logging functions
# We could expand upon this in the future to log to disk


# Info log
def i(TAG, msg):
    print('[INFO] [ ' + TAG + '] : ' + msg)


# Error log
def e(TAG, msg):
    print('[ERR] [ ' + str(TAG) + '] : ' + str(msg))


# Warning log
def w(TAG, msg):
    print('[WARN] [ ' + TAG + '] : ' + msg)
