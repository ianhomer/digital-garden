# Core

The core library is zero dependency logic that can be used for client and server
applications. It only depends on the type definitions which are in a separate
package, which it self is a zero dependency package.

The purpose of the core is light weight logic that can be asserted and bundled up with
other distributions in this mono repo, it is not a directly a public API,
although it can be part of an API if exposed by another package.
